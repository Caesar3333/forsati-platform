// © 2026 Forsati. All rights reserved.
// Jobs Page E2E Tests

import { test, expect } from "@playwright/test";

test.describe("Jobs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/jobs");
  });

  test("displays jobs list page", async ({ page }) => {
    await expect(page).toHaveTitle(/Job Opportunities|فرص العمل/);
    
    const heading = page.getByRole("heading", { name: /Job Opportunities/i });
    await expect(heading).toBeVisible();
  });

  test("has search functionality", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search for a job/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("Software Engineer");
    await page.waitForURL(/search=Software/);
  });

  test("displays filter sidebar", async ({ page }) => {
    const filterSection = page.locator('[data-testid="filters"]');
    await expect(filterSection).toBeVisible();
  });

  test("can filter by job type", async ({ page }) => {
    const fullTimeCheckbox = page.getByLabel(/Full-time/i);
    await fullTimeCheckbox.click();

    await page.waitForURL(/type=full-time/);
  });

  test("displays job cards", async ({ page }) => {
    const jobCards = page.locator('[data-testid="job-card"]');
    const count = await jobCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("can navigate to job detail", async ({ page }) => {
    const firstJobCard = page.locator('[data-testid="job-card"]').first();
    await firstJobCard.click();

    await expect(page).toHaveURL(/\/jobs\/.+/);
  });

  test("pagination works", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: /Next/i });
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForURL(/page=2/);
    }
  });
});

test.describe("Job Detail Page", () => {
  test("displays job details", async ({ page }) => {
    // Navigate to a specific job (mock or real)
    await page.goto("/en/jobs/test-job-id");

    // Should show job title
    const jobTitle = page.getByRole("heading", { level: 1 });
    await expect(jobTitle).toBeVisible();
  });

  test("shows apply button for unauthenticated users", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    const loginToApplyButton = page.getByRole("button", { name: /Login to Apply/i });
    await expect(loginToApplyButton).toBeVisible();
  });

  test("can share job via copy link", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Should show toast notification
    const toast = page.locator('[role="alert"]');
    await expect(toast).toBeVisible();
  });

  test("displays company information", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    const companyCard = page.locator('[data-testid="company-card"]');
    await expect(companyCard).toBeVisible();
  });

  test("has proper meta tags for SEO", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(ogDescription).toBeTruthy();
  });
});
