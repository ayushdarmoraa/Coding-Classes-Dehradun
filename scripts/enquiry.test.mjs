import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
let sendMail = async () => ({ messageId: "test-message" });
let writtenEnquiries = [];
let mailOptions = [];

const fsMock = {
  existsSync: () => false,
  mkdirSync: () => {},
  readFileSync: () => JSON.stringify(writtenEnquiries),
  writeFileSync: (_filename, contents) => {
    writtenEnquiries = JSON.parse(contents);
  },
};

const nativeRequire = (specifier) => {
  if (specifier === "next/server") {
    return {
      NextResponse: {
        json: (body, init = {}) => ({
          status: init.status ?? 200,
          body,
        }),
      },
    };
  }
  if (specifier === "nodemailer") {
    return {
      __esModule: true,
      default: {
        createTransport: () => ({
          sendMail: async (options) => {
            mailOptions.push(options);
            return sendMail(options);
          },
        }),
      },
    };
  }
  if (specifier === "fs") return { __esModule: true, default: fsMock };
  if (specifier === "path") return { __esModule: true, default: path };
  return require(specifier);
};

function loadTypeScript(relativePath) {
  const filename = path.resolve(repositoryRoot, relativePath);
  const source = readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(
    nativeRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const { POST } = loadTypeScript("src/app/api/enquiry/route.ts");
const components = new Map();

function loadComponent(relativePath) {
  if (components.has(relativePath)) return components.get(relativePath);
  const filename = path.resolve(repositoryRoot, relativePath);
  const source = readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier === "react") return React;
    if (specifier === "@/lib/analytics") {
      return {
        derivePageContext: () => ({ page_type: "contact", course_slug: undefined }),
        trackLeadClick: () => {},
        trackForm: () => {},
      };
    }
    if (specifier.startsWith("@/components/ui/")) {
      return loadComponent(
        `src/components/ui/${specifier.slice("@/components/ui/".length)}.tsx`,
      );
    }
    if (specifier.startsWith("@/")) {
      throw new Error(`Unexpected component dependency: ${specifier}`);
    }
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", compiled)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  components.set(relativePath, loadedModule.exports);
  return loadedModule.exports;
}

test.beforeEach(() => {
  sendMail = async () => ({ messageId: "test-message" });
  writtenEnquiries = [];
  mailOptions = [];
});

test("enquiry API persists and sends a valid enquiry through the configured handler", async () => {
  const response = await POST(
    new Request("http://localhost/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Test Learner",
        email: "learner@example.test",
        phone: "",
        course: "python",
        message: "Please share course details.",
      }),
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(writtenEnquiries.length, 1);
  assert.equal(writtenEnquiries[0].email, "learner@example.test");
  assert.equal(mailOptions.length, 1);
  assert.equal(mailOptions[0].to, process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com");
});

test("enquiry API reports SMTP failure instead of returning success", async () => {
  sendMail = async () => {
    throw new Error("test SMTP failure");
  };
  const response = await POST(
    new Request("http://localhost/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Test Learner",
        email: "learner@example.test",
        message: "Please share course details.",
      }),
    }),
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.success, false);
  assert.equal(writtenEnquiries.length, 1);
});

test("enquiry API rejects invalid fields without sending an email", async () => {
  const response = await POST(
    new Request("http://localhost/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "invalid",
        message: "",
      }),
    }),
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.deepEqual(
    response.body.errors.map(({ field }) => field),
    ["name", "email", "message"],
  );
  assert.equal(mailOptions.length, 0);
});

test("enquiry form controls have associated labels and accessible field errors", () => {
  for (const [componentPath, tagName] of [
    ["src/components/ui/Input.tsx", "input"],
    ["src/components/ui/Select.tsx", "select"],
    ["src/components/ui/Textarea.tsx", "textarea"],
  ]) {
    const Component = loadComponent(componentPath).default;
    const markup = renderToStaticMarkup(
      React.createElement(Component, {
        id: "field",
        label: "Field label",
        name: "field",
        error: "Field is required",
        ...(tagName === "select" ? { options: [] } : {}),
      }),
    );
    assert.match(markup, /<label[^>]*for="field"/);
    assert.match(markup, new RegExp(`<${tagName}[^>]*aria-invalid="true"`));
    assert.match(markup, /aria-describedby="field-error"/);
    assert.match(markup, /<p id="field-error"/);
    assert.match(markup, /Field is required/);
  }
});
