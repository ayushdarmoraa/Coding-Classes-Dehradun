import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __layoutShifts?: number[];
  }
}

test("homepage hero remains stable at mobile widths after hydration", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  let releaseScripts: () => void = () => {};
  let scriptGate = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
      await route.abort();
      return;
    }
    if (url.pathname.includes("/_next/") && url.pathname.endsWith(".js")) {
      await scriptGate;
    }
    await route.continue();
  });
  await page.addInitScript(() => {
    window.__layoutShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) window.__layoutShifts?.push(shift.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  const measurements = [];
  for (const width of [375, 360]) {
    for (let repetition = 1; repetition <= 3; repetition += 1) {
      await page.setViewportSize({ width, height: 812 });
      scriptGate = new Promise<void>((resolve) => {
        releaseScripts = resolve;
      });

      await page.goto("/", { waitUntil: "commit" });
      const heading = page.locator("#home-hero-heading");
      await expect(heading).toBeVisible();
      await page.waitForTimeout(150);
      const before = await page.evaluate(() => {
        const hero = document.querySelector("#home-hero-heading")?.closest("section");
        const container = hero?.querySelector<HTMLElement>(".container");
        const header = document.querySelector<HTMLElement>(".site-header");
        return {
          y: container ? Math.round(container.getBoundingClientRect().y) : null,
          headingInServerMarkup: document.documentElement.outerHTML.includes(
            'id="home-hero-heading"',
          ),
          headingVisible: Boolean(
            document.querySelector("#home-hero-heading")?.getClientRects().length,
          ),
          headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
          scrollY: window.scrollY,
        };
      });

      releaseScripts();
      await page.waitForLoadState("load");
      await page.waitForTimeout(8_000);
      const after = await page.evaluate(() => {
        const hero = document.querySelector("#home-hero-heading")?.closest("section");
        const container = hero?.querySelector<HTMLElement>(".container");
        const header = document.querySelector<HTMLElement>(".site-header");
        const decoration = hero?.querySelector<HTMLElement>(".absolute.rounded-full");
        const gridCard = Array.from(
          document.querySelectorAll<HTMLElement>("main [data-card]"),
        ).find((card) =>
          Array.from(card.parentElement?.classList ?? []).some((classToken) => {
            const utility = classToken.slice(classToken.lastIndexOf(":") + 1);
            return /^(?:inline-)?grid(?:$|-(?:cols|rows|flow)(?:-|$))/.test(utility);
          }),
        );
        return {
          y: container ? Math.round(container.getBoundingClientRect().y) : null,
          headingVisible: Boolean(
            document.querySelector("#home-hero-heading")?.getClientRects().length,
          ),
          headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
          scrollY: window.scrollY,
          decorationPosition: decoration ? getComputedStyle(decoration).position : null,
          decorationHasCardTag: decoration?.hasAttribute("data-card") ?? false,
          genuineGridCardTagged: Boolean(gridCard),
          maxLayoutShift: Math.max(0, ...(window.__layoutShifts ?? [])),
        };
      });

      measurements.push({ width, repetition, before, after });
      expect(before.headingInServerMarkup).toBe(true);
      expect(before.headingVisible).toBe(true);
      expect(before.y).toBe(64);
      expect(before.headerHeight).toBe(64);
      expect(after.y).toBe(64);
      expect(after.headerHeight).toBe(64);
      expect(after.scrollY).toBe(0);
      expect(after.headingVisible).toBe(true);
      expect(after.decorationPosition).toBe("absolute");
      expect(after.decorationHasCardTag).toBe(false);
      expect(after.genuineGridCardTagged).toBe(true);
      expect(after.maxLayoutShift).toBeLessThan(0.1);
    }
  }

  expect(errors).toEqual([]);
  console.info("Homepage mobile measurements:", JSON.stringify(measurements));
});

test("homepage globe and cards do not overlap across mobile and laptop widths", async ({
  page,
}) => {
  for (const width of [360, 375, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const heading = page.locator("#home-hero-heading");
    const copy = heading.locator("..");
    const sphere = page.getByTestId("home-tech-sphere");
    const mission = page.locator('[aria-labelledby="mission-preview-heading"]');
    const courses = page.locator("article").filter({
      has: page.getByRole("heading", { name: "Explore courses" }),
    });

    await expect(heading).toBeVisible();
    await expect(sphere).toBeVisible();
    const layout = await page.evaluate(() => {
      const rect = (element: Element | null) => {
        if (!element) return null;
        const { x, y, width: elementWidth, height } = element.getBoundingClientRect();
        return { left: x, top: y, right: x + elementWidth, bottom: y + height };
      };
      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        copy: rect(document.querySelector("#home-hero-heading")?.parentElement ?? null),
        sphere: rect(document.querySelector('[data-testid="home-tech-sphere"]')),
        mission: rect(document.querySelector('[aria-labelledby="mission-preview-heading"]')),
        courses: rect(
          Array.from(document.querySelectorAll("article")).find((article) =>
            article.querySelector("h2")?.textContent?.includes("Explore courses"),
          ) ?? null,
        ),
      };
    });

    expect(layout.copy).not.toBeNull();
    expect(layout.sphere).not.toBeNull();
    expect(layout.mission).not.toBeNull();
    expect(layout.courses).not.toBeNull();
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);

    const copyBox = await copy.boundingBox();
    const sphereBox = await sphere.boundingBox();
    const missionBox = await mission.boundingBox();
    const coursesBox = await courses.boundingBox();
    expect(copyBox).not.toBeNull();
    expect(sphereBox).not.toBeNull();
    expect(missionBox).not.toBeNull();
    expect(coursesBox).not.toBeNull();

    if (width < 1024) {
      expect(sphereBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height);
    } else {
      expect(sphereBox!.x).toBeGreaterThanOrEqual(copyBox!.x + copyBox!.width);
    }

    if (width < 768) {
      expect(coursesBox!.y).toBeGreaterThanOrEqual(missionBox!.y + missionBox!.height);
    } else {
      expect(coursesBox!.x).toBeGreaterThanOrEqual(missionBox!.x + missionBox!.width);
    }
  }
});
