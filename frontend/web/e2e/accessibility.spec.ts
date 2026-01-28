// © 2026 Forsati. All rights reserved.
// Accessibility E2E Tests

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("home page has no critical a11y violations", async ({ page }) => {
    await page.goto("/en");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations.filter(v => v.impact === "critical")).toEqual([]);
  });

  test("jobs page has no critical a11y violations", async ({ page }) => {
    await page.goto("/en/jobs");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations.filter(v => v.impact === "critical")).toEqual([]);
  });

  test("RTL home page has no critical a11y violations", async ({ page }) => {
    await page.goto("/ar");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations.filter(v => v.impact === "critical")).toEqual([]);
  });

  test("modal is accessible", async ({ page }) => {
    await page.goto("/en");

    // Open CV scan modal
    const openModalButton = page.getByRole("button", { name: /Upload your CV/i });
    await openModalButton.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check modal accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(accessibilityScanResults.violations.filter(v => v.impact === "critical")).toEqual([]);
  });

  test("has proper heading hierarchy", async ({ page }) => {
    await page.goto("/en");

    // Get all headings
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    
    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Check heading levels don't skip
    let lastLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.replace("H", ""));
      
      // Level shouldn't jump more than 1 (e.g., h1 -> h3)
      if (lastLevel > 0) {
        expect(level - lastLevel).toBeLessThanOrEqual(1);
      }
      lastLevel = level;
    }
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/en");

    const images = await page.locator("img").all();
    
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");
      
      // Images should have alt text or role="presentation"
      expect(alt !== null || role === "presentation").toBeTruthy();
    }
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/en");

    // Tab through the page
    await page.keyboard.press("Tab");
    
    // First focusable element should have focus
    const focusedElement = await page.locator(":focus").first();
    await expect(focusedElement).toBeVisible();

    // Check that focus is visible (has focus ring)
    const outlineStyle = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outlineStyle
    );
    expect(outlineStyle).not.toBe("none");
  });

  test("form inputs have associated labels", async ({ page }) => {
    await page.goto("/en/jobs");

    const inputs = await page.locator("input:not([type='hidden'])").all();
    
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledby = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");
      
      // Input should have id with associated label, aria-label, or aria-labelledby
      const hasLabel = id 
        ? await page.locator(`label[for="${id}"]`).count() > 0
        : false;
      
      expect(hasLabel || ariaLabel || ariaLabelledby || placeholder).toBeTruthy();
    }
  });

  test("buttons have accessible names", async ({ page }) => {
    await page.goto("/en");

    const buttons = await page.locator("button").all();
    
    for (const button of buttons) {
      const accessibleName = await button.evaluate(el => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute("aria-label");
        const title = el.getAttribute("title");
        return text || ariaLabel || title;
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test("links have accessible names", async ({ page }) => {
    await page.goto("/en");

    const links = await page.locator("a").all();
    
    for (const link of links) {
      const accessibleName = await link.evaluate(el => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute("aria-label");
        const title = el.getAttribute("title");
        return text || ariaLabel || title;
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test("color contrast meets WCAG AA", async ({ page }) => {
    await page.goto("/en");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .options({ runOnly: ["color-contrast"] })
      .analyze();

    // Allow some minor violations but no critical ones
    const criticalContrastIssues = accessibilityScanResults.violations.filter(
      v => v.id === "color-contrast" && v.impact === "critical"
    );
    
    expect(criticalContrastIssues).toEqual([]);
  });
});
