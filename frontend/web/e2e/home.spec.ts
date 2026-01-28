// © 2026 Forsati. All rights reserved.
// Home Page E2E Tests

import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/فرصتي|Forsati/);
  });

  test("displays hero section", async ({ page }) => {
    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();
  });

  test("displays CV scan CTA", async ({ page }) => {
    const cvScanButton = page.getByRole("button", { name: /ارفع سيرتك|Upload your CV/i });
    await expect(cvScanButton).toBeVisible();
  });

  test("can open CV scan modal", async ({ page }) => {
    const cvScanButton = page.getByRole("button", { name: /ارفع سيرتك|Upload your CV/i });
    await cvScanButton.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test("displays featured jobs section", async ({ page }) => {
    const featuredJobs = page.locator('[data-testid="featured-jobs"]');
    await expect(featuredJobs).toBeVisible();
  });

  test("navigation works", async ({ page }) => {
    const jobsLink = page.getByRole("link", { name: /الوظائف|Jobs/i });
    await jobsLink.click();

    await expect(page).toHaveURL(/\/jobs/);
  });
});

test.describe("Home Page - Arabic (RTL)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ar");
  });

  test("page is in RTL direction", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("has Arabic content", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    const text = await heading.textContent();
    expect(text).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
  });
});

test.describe("Home Page - English (LTR)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("page is in LTR direction", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "ltr");
  });

  test("has English content", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    const text = await heading.textContent();
    expect(text).toMatch(/[a-zA-Z]/);
  });
});
