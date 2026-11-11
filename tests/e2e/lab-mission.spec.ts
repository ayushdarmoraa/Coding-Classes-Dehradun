import { expect, test, type Locator, type Page } from "@playwright/test";

async function focusUsingTab(page: Page, target: Locator) {
  for (let index = 0; index < 40; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }

  throw new Error("The target control was not reachable with keyboard navigation.");
}

async function activateUsingEnter(page: Page, target: Locator) {
  await focusUsingTab(page, target);
  await page.keyboard.press("Enter");
}

async function expectAvailableNavigation(navigation: Locator) {
  for (const label of ["DCA Lab", "Guides", "About", "Contact"]) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(navigation.getByText("Courses", { exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Projects" })).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/*google-analytics.com/**", (route) => route.abort());
  await page.route("**/*googletagmanager.com/**", (route) => route.abort());
  await page.route("**/api/enquiry", (route) => route.abort());
});

test("anonymous learner completes and resumes the featured mission", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const mainNavigation = page.getByRole("navigation", {
    name: "Main navigation",
  });
  await expectAvailableNavigation(mainNavigation);
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run Tests" })).toHaveCount(0);
  const heroHeading = await page.getByRole("heading", { level: 1 }).boundingBox();
  const missionPreview = await page
    .locator('article[aria-labelledby="mission-preview-heading"]')
    .boundingBox();
  if (!heroHeading || !missionPreview) {
    throw new Error("The hero heading and static mission preview must render.");
  }
  expect(missionPreview.x).toBeGreaterThan(heroHeading.x + heroHeading.width / 2);
  await page
    .locator("main")
    .getByRole("link", { name: "Try Free Challenge" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/lab\/javascript\/discount-calculation-bug$/);

  const editor = page.locator(".cm-content[contenteditable='true']");
  await expect(editor).toContainText("return price;");

  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(
    page.getByRole("region", { name: "Test results" }).getByRole("status"),
  ).toHaveText("1 of 4 mission tests passed.");

  await page.getByRole("button", { name: "Show hint 1" }).click();
  await expect(page.getByText(/Hint 1:/)).toBeVisible();

  await page.getByRole("button", { name: "Reset mission" }).click();
  await expect(editor).toContainText("return price;");

  await editor.fill(
    "function calculateTotal(price, discountPercent) {\n  return price - (price * discountPercent) / 100;\n}",
  );
  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(page.getByText("All 4 mission tests passed.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mission Complete" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skill Map" })).toBeVisible();

  await page.reload();
  await expect(editor).toContainText("return price - (price * discountPercent) / 100;");
  await expect(
    page.getByRole("heading", { name: "Mission Complete" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skill Map" })).toBeVisible();

  await page.getByRole("link", { name: "Explore Full-Stack Course" }).click();
  await expect(page).toHaveURL(/\/courses\/full-stack$/);
  await expect(
    page.getByRole("link", { name: "Contact us about this course" }),
  ).toBeVisible();
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run Tests" })).toHaveCount(0);
});

test("narrow mobile learner completes the mission using keyboard navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const challengeLink = page
    .locator("main")
    .getByRole("link", { name: "Try a Free Coding Challenge" });
  await expect(challengeLink).toBeVisible();
  await activateUsingEnter(page, challengeLink);
  await expect(page).toHaveURL(/\/lab\/javascript\/discount-calculation-bug$/);

  const editor = page.locator(".cm-content[contenteditable='true']");
  await focusUsingTab(page, editor);
  await expect(editor).toBeFocused();
  const focusStyle = await page.locator(".cm-editor").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return `${style.outlineStyle} ${style.boxShadow}`;
  });
  expect(focusStyle).not.toBe("none none");

  await page.keyboard.press("Control+A");
  await page.keyboard.insertText("function calculateTotal( {");
  const runButton = page.getByRole("button", { name: "Run Tests" });
  await activateUsingEnter(page, runButton);
  await expect(
    page.getByRole("region", { name: "Test results" }).getByRole("alert"),
  ).toContainText("Syntax error");
  await expect(page.getByRole("button", { name: "Run Again" })).toBeEnabled();

  const hintButton = page.getByRole("button", { name: "Show hint 1" });
  await activateUsingEnter(page, hintButton);
  await expect(page.getByText(/Hint 1:/)).toBeVisible();

  await activateUsingEnter(page, page.getByRole("button", { name: "Reset mission" }));
  await expect(editor).toContainText("return price;");

  await focusUsingTab(page, editor);
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(
    "function calculateTotal(price, discountPercent) {\n  return price - (price * discountPercent) / 100;\n}",
  );
  await activateUsingEnter(page, runButton);
  await expect(page.getByText("All 4 mission tests passed.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mission Complete" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skill Map" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    editor: document.querySelector<HTMLElement>(".cm-editor")?.getBoundingClientRect()
      .width,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.editor).toBeLessThanOrEqual(dimensions.viewport);

  await activateUsingEnter(
    page,
    page.getByRole("link", { name: "Explore Full-Stack Course" }),
  );
  await expect(page).toHaveURL(/\/courses\/full-stack$/);
  await expect(
    page.getByRole("link", { name: "Contact us about this course" }),
  ).toBeVisible();

  await page.goto("/");
  await activateUsingEnter(
    page,
    page.locator("summary").filter({ hasText: "Menu" }),
  );
  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await expectAvailableNavigation(mobileNavigation);
});
