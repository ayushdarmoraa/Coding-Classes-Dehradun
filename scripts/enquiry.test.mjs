import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
let sendMail = async () => ({ messageId: "test-message" });
let mailOptions = [];
let transportOptions = [];
let POST;
const analyticsEvents = [];
let requestNumber = 0;

function nativeRequire(specifier, parentFilename) {
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
  if (specifier.startsWith("@/")) {
    const relativePath = specifier.slice(2).replaceAll("/", path.sep);
    return loadTypeScript(`src/${relativePath}.ts`);
  }
  if (specifier.startsWith(".")) {
    const resolved = path.resolve(path.dirname(parentFilename), specifier);
    const typescriptPath = resolved.endsWith(".ts")
      ? resolved
      : `${resolved}.ts`;
    if (existsSync(typescriptPath)) {
      return loadTypeScript(path.relative(repositoryRoot, typescriptPath));
    }
    return require(resolved);
  }
  return require(specifier);
}

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
  const moduleRequire = (specifier) => nativeRequire(specifier, filename);
  new Function("require", "module", "exports", compiled)(
    moduleRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const { createEnquiryHandler } = loadTypeScript("src/lib/enquiry-handler.ts");
const syntheticSmtpEnvironment = {
  SMTP_HOST: "smtp.example.test",
  SMTP_PORT: "587",
  SMTP_SECURE: "false",
  SMTP_USER: "sender@example.test",
  SMTP_PASS: "synthetic-test-only",
  SMTP_FROM_NAME: "DCA Test Sender",
  SMTP_FROM_EMAIL: "no-reply@example.test",
  CONTACT_EMAIL: "inbox@example.test",
};
const {
  enquiryLeadContextSchema,
  enquirySchema,
} = loadTypeScript("src/lib/enquiry-schema.ts");
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
        trackForm: (step, params) => analyticsEvents.push({ step, params }),
        trackWhatsAppEnquiryClick: () => {},
        sanitizeAnalyticsParams: (_event, params) => params,
      };
    }
    if (specifier === "@/components/analytics/AnalyticsRouteRegistryProvider") {
      return { useAnalyticsRouteRegistry: () => undefined };
    }
    if (specifier === "@/lib/enquiry-schema") {
      return { enquirySchema };
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
  mailOptions = [];
  transportOptions = [];
  POST = createEnquiryHandler(syntheticSmtpEnvironment, (options) => {
    transportOptions.push(options);
    return {
      sendMail: async (options) => {
        mailOptions.push(options);
        return sendMail(options);
      },
    };
  });
  analyticsEvents.length = 0;
});

function validPayload(overrides = {}) {
  return {
    name: "Test Learner",
    email: "learner@example.test",
    phone: "",
    course: "python",
    message: "Please share course details.",
    ...overrides,
  };
}

function requestFor(payload, ip) {
  requestNumber += 1;
  return new Request("http://localhost/api/enquiry", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip ?? `198.51.100.${requestNumber}`,
    },
    body: JSON.stringify(payload),
  });
}

test("shared enquiry schema accepts documented field limits and rejects oversized values", () => {
  const maximumEmail =
    `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  const accepted = enquirySchema.safeParse(
    validPayload({
      name: "N".repeat(100),
      email: maximumEmail,
      phone: `+${"1".repeat(29)}`,
      message: "m".repeat(2000),
    }),
  );
  assert.equal(accepted.success, true);

  for (const payload of [
    validPayload({ name: "n".repeat(101) }),
    validPayload({ email: `${"a".repeat(250)}@x.com` }),
    validPayload({ phone: `+${"1".repeat(30)}` }),
    validPayload({ message: "m".repeat(2001) }),
  ]) {
    assert.equal(enquirySchema.safeParse(payload).success, false);
  }
});

test("shared schema preserves course values and allowlists complete Lab lead context", () => {
  for (const course of ["", "full-stack", "data-science", "python", "java", "other"]) {
    assert.equal(enquirySchema.safeParse(validPayload({ course })).success, true);
  }
  assert.equal(
    enquirySchema.safeParse(
      validPayload({
        source: "lab",
        challenge: "discount-calculation-bug",
        track: "javascript",
        relatedCourse: "full-stack",
      }),
    ).success,
    true,
  );
  assert.equal(
    enquiryLeadContextSchema.safeParse({
      source: "lab",
      challenge: "unknown-challenge",
      track: "javascript",
      relatedCourse: "full-stack",
    }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({
      ...validPayload(),
      learnerCode: "return secret;",
    }).success,
    false,
  );
});

test("enquiry API sends a valid enquiry using server-owned sender settings", async () => {
  const response = await POST(
    requestFor(validPayload({ email: "learner@example.test" })),
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(mailOptions.length, 1);
  assert.deepEqual(transportOptions[0], {
    host: "smtp.example.test",
    port: 587,
    secure: false,
    auth: { user: "sender@example.test", pass: "synthetic-test-only" },
  });
  assert.deepEqual(mailOptions[0].from, {
    name: "DCA Test Sender",
    address: "no-reply@example.test",
  });
  assert.equal(mailOptions[0].to, "inbox@example.test");
  assert.equal(mailOptions[0].subject, "New website enquiry");
  assert.equal("replyTo" in mailOptions[0], false);
  assert.doesNotMatch(JSON.stringify(mailOptions[0].from), /learner@example\.test/);
});

test("missing or invalid SMTP configuration fails safely before transport creation", async () => {
  for (const env of [
    { ...syntheticSmtpEnvironment, SMTP_HOST: "" },
    { ...syntheticSmtpEnvironment, SMTP_USER: "" },
    { ...syntheticSmtpEnvironment, SMTP_PASS: "" },
    { ...syntheticSmtpEnvironment, SMTP_PORT: "not-a-port" },
    { ...syntheticSmtpEnvironment, SMTP_PORT: "65536" },
  ]) {
    let transportCreationCount = 0;
    const handler = createEnquiryHandler(env, () => {
      transportCreationCount += 1;
      throw new Error("Transport must not be created for invalid configuration");
    });
    const response = await handler(requestFor(validPayload()));

    assert.equal(response.status, 503);
    assert.deepEqual(response.body, {
      success: false,
      error: "Enquiry service is temporarily unavailable. Please try again later.",
    });
    assert.equal(transportCreationCount, 0);
  }
});

test("enquiry API returns a generic error and redacted diagnostics when SMTP fails", async () => {
  sendMail = async () => {
    const error = new Error(
      "SMTP private detail Test Learner learner@example.test synthetic-test-only",
    );
    error.code = "ETIMEDOUT";
    throw error;
  };
  const diagnostics = [];
  const originalConsoleError = console.error;
  console.error = (...args) => diagnostics.push(args);
  let response;
  try {
    response = await POST(requestFor(validPayload()));
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.status, 500);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, "Unable to send enquiry. Please try again.");
  assert.doesNotMatch(JSON.stringify(response.body), /SMTP private detail|learner@example\.test/);
  assert.match(JSON.stringify(diagnostics), /ETIMEDOUT/);
  assert.doesNotMatch(
    JSON.stringify(diagnostics),
    /SMTP private detail|Test Learner|learner@example\.test|synthetic-test-only/,
  );
});

test("enquiry API rejects invalid and oversized fields with compatible field errors", async () => {
  const response = await POST(requestFor({
    name: "A",
    email: "invalid",
    message: "",
  }));

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.deepEqual(
    response.body.errors.map(({ field }) => field),
    ["name", "email", "message"],
  );
  assert.equal(mailOptions.length, 0);

  const tooLongResponse = await POST(
    requestFor(validPayload({ message: "m".repeat(2001) })),
  );
  assert.equal(tooLongResponse.status, 400);
  assert.ok(
    tooLongResponse.body.errors.some(({ field }) => field === "message"),
  );
  assert.equal(mailOptions.length, 0);
});

test("enquiry API safely escapes HTML email content and rejects header injection", async () => {
  const response = await POST(
    requestFor(
      validPayload({
        name: `<img src="x">`,
        message: `<script>alert("x")</script>\n&`,
      }),
    ),
  );
  assert.equal(response.status, 200);
  assert.match(mailOptions[0].html, /&lt;img src=&quot;x&quot;&gt;/);
  assert.match(
    mailOptions[0].html,
    /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;<br\/>&amp;/,
  );
  assert.doesNotMatch(mailOptions[0].html, /<script>|<img/);
  assert.doesNotMatch(mailOptions[0].subject, /Test Learner|<img/);

  const injectionResponse = await POST(
    requestFor(validPayload({ name: "Learner\r\nBcc: attacker@example.test" })),
  );
  assert.equal(injectionResponse.status, 400);
  assert.equal(mailOptions.length, 1);
});

test("enquiry honeypot responds successfully without sending email", async () => {
  const response = await POST(requestFor({ website: "bot-filled" }));
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true });
  assert.equal(mailOptions.length, 0);
});

test("enquiry API preserves HTTP 429 behavior after five requests in one process window", async () => {
  let response;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    response = await POST(
      requestFor(
        validPayload(),
        "203.0.113.42",
      ),
    );
  }
  assert.equal(response.status, 429);
  assert.equal(response.body.success, false);
  assert.equal(mailOptions.length, 5);
});

test("enquiry API includes only approved Lab context in the staff email", async () => {
  const response = await POST(
    requestFor(
      validPayload({
        source: "lab",
        challenge: "discount-calculation-bug",
        track: "javascript",
        relatedCourse: "full-stack",
      }),
    ),
  );
  assert.equal(response.status, 200);
  assert.match(mailOptions[0].text, /Origin: DCA Lab/);
  assert.match(mailOptions[0].text, /Challenge: discount-calculation-bug/);
  assert.match(mailOptions[0].text, /Track: javascript/);
  assert.match(mailOptions[0].text, /Related course: full-stack/);
  assert.doesNotMatch(mailOptions[0].html, /learnerCode|student code|assessment answer/i);
});

test("plain-text email delimits multiline user messages from verified Lab context", async () => {
  const forgedMessage =
    "Please help.\nOrigin: DCA Lab\nChallenge: discount-calculation-bug\nTrack: javascript\nRelated course: full-stack";
  const response = await POST(
    requestFor(validPayload({ message: forgedMessage })),
  );

  assert.equal(response.status, 200);
  assert.ok(mailOptions[0].text.includes(
    `User message (untrusted, JSON-encoded): ${JSON.stringify(forgedMessage)}`,
  ));
  assert.match(mailOptions[0].text, /Verified lead context:\r?\nNone/);
  assert.doesNotMatch(mailOptions[0].text, /Origin: DCA Lab\r?\nChallenge:/);
});

test("form analytics retains event context and filters PII and staff-only data", () => {
  const { trackForm } = loadTypeScript("src/lib/analytics.ts");
  const events = [];
  const previousWindow = globalThis.window;
  const analyticsRoutes = {
    courseSlugs: ["full-stack", "data-science", "python", "java"],
    guideSlugs: ["published-guide"],
    challengeSlugs: ["discount-calculation-bug"],
    challengeIds: ["discount-calculation-bug"],
    labTracks: ["javascript"],
    citySlugs: ["dehradun", "bangalore", "mumbai", "noida"],
    canonicalPaths: [
      "/",
      "/contact",
      "/courses/python",
      "/blog/published-guide",
      "/lab",
      "/lab/javascript/discount-calculation-bug",
      "/locations/dehradun",
    ],
  };
  globalThis.window = {
    gtag: (...args) => events.push(args),
    __DCA_ANALYTICS_ROUTES__: analyticsRoutes,
  };
  try {
    trackForm("submit", {
      page_type: "contact",
      course_slug: "(none)",
      city: "(unknown)",
      page_path: "/contact",
      has_message: true,
      name: "Test Learner",
      email: "learner@example.test",
      phone: "+91 9876543210",
      message: "private message",
      learnerCode: "return private;",
      source: "lab",
      challenge: "discount-calculation-bug",
      relatedCourse: "full-stack",
      field_errors: ["email", "private free text"],
    });
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }

  assert.equal(events[0][0], "event");
  assert.equal(events[0][1], "lead_form_submit");
  assert.deepEqual(events[0][2], {
    page_type: "contact",
    course_slug: "(none)",
    city: "(unknown)",
    page_path: "/contact",
    has_message: true,
    field_errors: ["email"],
  });
  assert.doesNotMatch(JSON.stringify(events), /Test Learner|learner@example\.test|private message|return private|discount-calculation-bug/);
});

test("analytics route context and event payloads reject unknown and PII-like values", () => {
  const {
    derivePageContext,
    track,
    trackLeadClick,
  } = loadTypeScript("src/lib/analytics.ts");
  const events = [];
  const previousWindow = globalThis.window;
  globalThis.window = {
    gtag: (...args) => events.push(args),
    __DCA_ANALYTICS_ROUTES__: {
      courseSlugs: ["full-stack", "data-science", "python", "java"],
      guideSlugs: ["published-guide"],
      challengeSlugs: ["discount-calculation-bug"],
      challengeIds: ["discount-calculation-bug"],
      labTracks: ["javascript"],
      citySlugs: ["dehradun", "bangalore", "mumbai", "noida"],
      canonicalPaths: [
        "/contact",
        "/courses/python",
        "/blog/published-guide",
        "/locations/dehradun",
      ],
    },
  };

  try {
    assert.deepEqual(derivePageContext("/courses/python"), {
      page_type: "course_detail",
      course_slug: "python",
      city: "dehradun",
    });
    for (const unsafePath of [
      "/courses/learner@example.test",
      "/courses/%70ython",
      "/courses/python?email=learner%40example.test",
      "/blog/unknown-guide",
      "/locations/learner-name",
    ]) {
      assert.deepEqual(
        derivePageContext(unsafePath),
        { page_type: "generic", course_slug: "", city: "(unknown)" },
        `unsafe or unknown path should not yield analytics context: ${unsafePath}`,
      );
    }

    trackLeadClick("whatsapp", {
      page_type: "contact",
      course_slug: "unknown-course",
      city: "Learner Name",
      page_path: "/contact?email=learner%40example.test",
      name: "Test Learner",
      email: "learner@example.test",
      phone: "+1-555-0100",
      message: "private enquiry text",
      url: "https://wa.me/123?text=private",
      stack: "Error: private stack",
      channel: "phone",
    });
    track("cta_enroll_click", {
      page_type: "course_detail",
      course_slug: "python",
      city: "dehradun",
      location: "course_detail",
      variant: "online_course_details",
    });
    track("cta_home_read_guide", { guide_slug: "published-guide" });
    track("cta_home_read_guide", {
      guide_slug: "unknown-guide",
      email: "learner@example.test",
      url: "https://example.test/?phone=5551234",
    });
    track("unapproved_event", { email: "learner@example.test" });

    assert.deepEqual(events, [
      [
        "event",
        "lead_contact_click",
        { page_type: "contact", channel: "whatsapp" },
      ],
      [
        "event",
        "cta_enroll_click",
        {
          page_type: "course_detail",
          course_slug: "python",
          city: "dehradun",
          variant: "online_course_details",
          location: "course_detail",
        },
      ],
      ["event", "cta_home_read_guide", { guide_slug: "published-guide" }],
      ["event", "cta_home_read_guide", {}],
    ]);
    assert.doesNotMatch(
      JSON.stringify(events),
      /learner|example\.test|555-0100|private enquiry|wa\.me|private stack|unknown-course|unknown-guide/i,
    );
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("WhatsApp enquiry click analytics never receives the generated personal-data URL", () => {
  const { trackWhatsAppEnquiryClick } = loadTypeScript(
    "src/lib/analytics.ts",
  );
  const { createWhatsAppEnquiryUrl } = loadComponent(
    "src/components/features/EnquiryForm.tsx",
  );
  const events = [];
  const previousWindow = globalThis.window;
  globalThis.window = {
    gtag: (...args) => events.push(args),
    __DCA_ANALYTICS_ROUTES__: {
      courseSlugs: ["full-stack", "data-science", "python", "java"],
      guideSlugs: [],
      challengeSlugs: ["discount-calculation-bug"],
      challengeIds: ["discount-calculation-bug"],
      labTracks: ["javascript"],
      citySlugs: ["dehradun"],
      canonicalPaths: ["/contact"],
    },
  };

  try {
    const formData = {
      name: "Test Learner",
      email: "learner@example.test",
      phone: "+1-555-0100",
      course: "full-stack",
      message: "Please call me about enrollment.",
    };
    const generatedUrl = createWhatsAppEnquiryUrl(formData);
    trackWhatsAppEnquiryClick("/contact");

    assert.deepEqual(events, [
      [
        "event",
        "lead_contact_click",
        {
          page_type: "contact",
          city: "(unknown)",
          page_path: "/contact",
          channel: "whatsapp",
        },
      ],
    ]);
    assert.doesNotMatch(
      JSON.stringify(events),
      /Test Learner|learner@example\.test|555-0100|Please call|wa\.me/,
    );
    assert.match(generatedUrl, /Test%20Learner|Test\+Learner/);
    const formSource = readFileSync(
      path.join(repositoryRoot, "src/components/features/EnquiryForm.tsx"),
      "utf8",
    );
    assert.match(formSource, /trackWhatsAppEnquiryClick\(pathname\)/);
    assert.match(formSource, /window\.open\(\s*createWhatsAppEnquiryUrl/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("enquiry form preserves accessible feedback and removes the placeholder review CTA", () => {
  const EnquiryFormModule = loadComponent(
    "src/components/features/EnquiryForm.tsx",
  );
  const EnquiryForm = EnquiryFormModule.default;
  const markup = renderToStaticMarkup(
    React.createElement(EnquiryForm, {}),
  );
  assert.match(markup, /<form[^>]*aria-busy="false"/);
  assert.match(markup, /maxLength="100"/);
  assert.match(markup, /maxLength="254"/);
  assert.match(markup, /maxLength="30"/);
  assert.match(markup, /maxLength="2000"/);
  assert.match(markup, /<button[^>]*>WhatsApp Us<\/button>/);
  assert.doesNotMatch(markup, /wa\.me/);
  assert.doesNotMatch(markup, /g\.page\/r\/|Leave a Google Review/);
  const successMarkup = renderToStaticMarkup(
    React.createElement(EnquiryFormModule.EnquirySuccessNotice, {
      message: "Thanks, we received your enquiry.",
      statusRef: { current: null },
    }),
  );
  const errorMarkup = renderToStaticMarkup(
    React.createElement(EnquiryFormModule.EnquiryErrorNotice, {
      message: "Unable to send enquiry. Please try again.",
      statusRef: { current: null },
    }),
  );
  assert.match(successMarkup, /role="status" aria-live="polite"/);
  assert.match(successMarkup, /Thanks, we received your enquiry\./);
  assert.match(errorMarkup, /role="alert" aria-live="assertive"/);
  assert.match(errorMarkup, /Unable to send enquiry\. Please try again\./);
  assert.doesNotMatch(successMarkup, /g\.page\/r\/|Leave a Google Review/);
});

test("WhatsApp enquiry link includes all submitted details in a structured message", () => {
  const { createWhatsAppEnquiryUrl, resolveWhatsAppFormData } = loadComponent(
    "src/components/features/EnquiryForm.tsx",
  );
  const submittedFormData = {
    name: "Test Learner",
    email: "learner@example.test",
    phone: "+91 9876543210",
    course: "full-stack",
    message: "I would like to know more.",
  };
  const currentFormData = {
    name: "",
    email: "",
    phone: "",
    course: "",
    message: "",
  };
  const resolvedData = resolveWhatsAppFormData(
    currentFormData,
    submittedFormData,
    "success",
  );
  const url = new URL(createWhatsAppEnquiryUrl(resolvedData));

  assert.equal(url.origin + url.pathname, "https://wa.me/917037905464");
  assert.equal(
    url.searchParams.get("text"),
    [
      "Hi, I would like to enquire about a course at Doon Coding Academy.",
      "",
      "Full Name: Test Learner",
      "Email Address: learner@example.test",
      "Phone Number: +91 9876543210",
      "Course of Interest: Full-Stack Development (MERN + Gen AI)",
      "",
      "Message:",
      "I would like to know more.",
    ].join("\n"),
  );
  assert.equal(
    resolveWhatsAppFormData(currentFormData, submittedFormData, "idle"),
    currentFormData,
    "edited form values should replace the successful submission",
  );
});

test("enquiry API does not import filesystem or local-record persistence", () => {
  const source = readFileSync(
    path.join(repositoryRoot, "src/lib/enquiry-handler.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /node:fs|writeFile|appendFile|data\/enquiries\.json/,
  );
});

test("safe environment template keeps SMTP credentials blank and ignores private files", () => {
  const example = readFileSync(path.join(repositoryRoot, ".env.example"), "utf8");
  const gitignore = readFileSync(path.join(repositoryRoot, ".gitignore"), "utf8");
  const values = Object.fromEntries(
    example
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

  for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM_EMAIL"]) {
    assert.equal(values[key], "", `${key} must remain blank in the example`);
  }
  assert.match(gitignore, /^\.env\.local$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
  assert.match(gitignore, /^\/data\/enquiries\.json$/m);
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
