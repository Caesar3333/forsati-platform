// © 2026 Forsati. All rights reserved.
// Authentication E2E Tests

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login button when not authenticated", async ({ page }) => {
    await page.goto("/en");

    const loginButton = page.getByRole("link", { name: /Login|تسجيل الدخول/i });
    await expect(loginButton).toBeVisible();
  });

  test("redirects to login page when clicking protected action", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    const applyButton = page.getByRole("button", { name: /Login to Apply/i });
    await applyButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("login page has required elements", async ({ page }) => {
    await page.goto("/auth/login");

    // Should have login form or SSO buttons
    const keycloakButton = page.getByRole("button", { name: /Keycloak|SSO/i });
    const googleButton = page.getByRole("button", { name: /Google/i });

    const hasKeycloak = await keycloakButton.isVisible().catch(() => false);
    const hasGoogle = await googleButton.isVisible().catch(() => false);

    expect(hasKeycloak || hasGoogle).toBeTruthy();
  });

  test("preserves callback URL after login", async ({ page }) => {
    // Try to access protected page
    await page.goto("/en/profile");

    // Should be redirected to login with callback
    await expect(page).toHaveURL(/callbackUrl/);
  });
});

test.describe("Authenticated User", () => {
  test.use({
    storageState: "e2e/.auth/user.json", // Pre-authenticated state
  });

  test.skip("shows user menu when authenticated", async ({ page }) => {
    await page.goto("/en");

    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test.skip("can access profile page", async ({ page }) => {
    await page.goto("/en/profile");

    await expect(page).toHaveURL(/\/profile/);
    const heading = page.getByRole("heading", { name: /Profile|الملف الشخصي/i });
    await expect(heading).toBeVisible();
  });

  test.skip("can apply to jobs", async ({ page }) => {
    await page.goto("/en/jobs/test-job-id");

    const applyButton = page.getByRole("button", { name: /Quick Apply/i });
    await expect(applyButton).toBeVisible();

    await applyButton.click();

    // Should open apply modal or redirect
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test.skip("can logout", async ({ page }) => {
    await page.goto("/en");

    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    const logoutButton = page.getByRole("button", { name: /Logout|تسجيل الخروج/i });
    await logoutButton.click();

    // Should redirect to home and show login button
    const loginButton = page.getByRole("link", { name: /Login/i });
    await expect(loginButton).toBeVisible();
  });
});
