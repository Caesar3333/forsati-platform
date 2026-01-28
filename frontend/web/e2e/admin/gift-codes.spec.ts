/**
 * Forsati Platform - Gift Codes E2E Tests
 * اختبارات رموز الهدايا
 */

import { test, expect, waitForTableLoad, searchInTable, getNotificationMessage, TEST_USERS } from './fixtures';

test.describe('Gift Codes Admin', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-gift-codes"]');
    await waitForTableLoad(adminPage);
  });

  test('should display gift codes list', async ({ adminPage }) => {
    await expect(adminPage.locator('.ant-table')).toBeVisible();
    
    // Verify columns
    await expect(adminPage.locator('th:has-text("Code")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Benefit")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Uses")')).toBeVisible();
  });

  test('should create single gift code', async ({ adminPage }) => {
    await adminPage.click('[data-testid="create-gift-code"]');
    
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Fill form
    const timestamp = Date.now();
    await adminPage.fill('[data-testid="form-code"]', `TEST${timestamp}`);
    await adminPage.fill('[data-testid="form-name_en"]', 'Test Gift Code');
    await adminPage.fill('[data-testid="form-name_ar"]', 'رمز هدية تجريبي');
    
    // Select benefit type
    await adminPage.click('[data-testid="form-benefit_type"]');
    await adminPage.click('.ant-select-item:has-text("Points")');
    
    // Set benefit value
    await adminPage.fill('[data-testid="form-benefit_value"]', '100');
    
    // Set max uses
    await adminPage.fill('[data-testid="form-max_uses"]', '10');
    
    // Set validity
    await adminPage.click('[data-testid="form-valid_from"]');
    await adminPage.click('.ant-picker-today-btn');
    
    // Submit
    await adminPage.click('[data-testid="submit-button"]');
    
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should create bulk gift codes', async ({ adminPage }) => {
    await adminPage.click('[data-testid="bulk-create-gift-codes"]');
    
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Fill bulk form
    await adminPage.fill('[data-testid="form-prefix"]', 'BULK');
    await adminPage.fill('[data-testid="form-count"]', '5');
    
    // Select benefit type
    await adminPage.click('[data-testid="form-benefit_type"]');
    await adminPage.click('.ant-select-item:has-text("Premium Days")');
    
    await adminPage.fill('[data-testid="form-benefit_value"]', '7');
    await adminPage.fill('[data-testid="form-max_uses"]', '1');
    
    // Submit
    await adminPage.click('[data-testid="submit-button"]');
    
    // Verify success and codes generated
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('5 codes created');
    
    // Verify codes appear in table
    await searchInTable(adminPage, 'BULK');
    const rowCount = await adminPage.locator('.ant-table-tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(5);
  });

  test('should revoke gift code', async ({ adminPage }) => {
    // Find an active code
    await adminPage.click('.ant-table-filter-trigger');
    await adminPage.click('text=Active');
    await adminPage.click('button:has-text("OK")');
    await waitForTableLoad(adminPage);
    
    // Click revoke on first row
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-revoke"]').click();
    
    // Confirm
    await expect(adminPage.locator('.ant-modal-confirm')).toBeVisible();
    await adminPage.click('.ant-modal-confirm-btns .ant-btn-primary');
    
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('revoked');
  });

  test('should view redemption history', async ({ adminPage }) => {
    // Click view redemptions on first row
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-view-redemptions"]').click();
    
    // Verify redemptions modal/section opens
    await expect(adminPage.locator('[data-testid="redemptions-list"]')).toBeVisible();
  });

  test('should filter by benefit type', async ({ adminPage }) => {
    // Open filter
    await adminPage.locator('.ant-table-filter-trigger').first().click();
    await adminPage.click('text=Points');
    await adminPage.click('button:has-text("OK")');
    
    await waitForTableLoad(adminPage);
    
    // Verify all rows have points benefit
    const benefitCells = adminPage.locator('.ant-table-tbody td:nth-child(3)');
    const count = await benefitCells.count();
    
    for (let i = 0; i < count; i++) {
      const text = await benefitCells.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('point');
    }
  });

  test('should export gift codes as CSV', async ({ adminPage }) => {
    // Click export button
    const [download] = await Promise.all([
      adminPage.waitForEvent('download'),
      adminPage.click('[data-testid="export-csv"]'),
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Gift Code Redemption Flow', () => {
  test('should allow user to redeem valid gift code', async ({ browser }) => {
    // Create a new gift code as admin
    const adminContext = await browser.newContext({ storageState: '.auth/admin.json' });
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-gift-codes"]');
    await waitForTableLoad(adminPage);
    
    const testCode = `REDEEM${Date.now()}`;
    await adminPage.click('[data-testid="create-gift-code"]');
    await adminPage.fill('[data-testid="form-code"]', testCode);
    await adminPage.fill('[data-testid="form-name_en"]', 'Redemption Test');
    await adminPage.fill('[data-testid="form-name_ar"]', 'اختبار الاسترداد');
    await adminPage.click('[data-testid="form-benefit_type"]');
    await adminPage.click('.ant-select-item:has-text("Points")');
    await adminPage.fill('[data-testid="form-benefit_value"]', '50');
    await adminPage.fill('[data-testid="form-max_uses"]', '1');
    await adminPage.click('[data-testid="submit-button"]');
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
    
    await adminContext.close();
    
    // Login as candidate user
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // Navigate to gift code redemption page
    await userPage.goto('/account/redeem');
    
    // Enter the gift code
    await userPage.fill('[data-testid="gift-code-input"]', testCode);
    await userPage.click('[data-testid="redeem-button"]');
    
    // Verify success
    await expect(userPage.locator('text=50 points')).toBeVisible();
    await expect(userPage.locator('.ant-result-success')).toBeVisible();
    
    await userContext.close();
    
    // Verify redemption is recorded in admin
    const verifyContext = await browser.newContext({ storageState: '.auth/admin.json' });
    const verifyPage = await verifyContext.newPage();
    
    await verifyPage.goto('/admin');
    await verifyPage.click('[data-testid="admin-menu-gift-codes"]');
    await searchInTable(verifyPage, testCode);
    
    // Check uses count increased
    const usesCell = verifyPage.locator('.ant-table-tbody tr').first().locator('td:nth-child(5)');
    const usesText = await usesCell.textContent();
    expect(usesText).toContain('1');
    
    await verifyContext.close();
  });

  test('should reject already redeemed code', async ({ browser }) => {
    // Try to redeem a code that's already at max uses
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('/account/redeem');
    await userPage.fill('[data-testid="gift-code-input"]', 'ALREADY_USED_CODE');
    await userPage.click('[data-testid="redeem-button"]');
    
    // Verify error
    await expect(userPage.locator('text=Code has reached maximum uses')).toBeVisible();
    
    await userContext.close();
  });

  test('should reject expired code', async ({ browser }) => {
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('/account/redeem');
    await userPage.fill('[data-testid="gift-code-input"]', 'EXPIRED_CODE');
    await userPage.click('[data-testid="redeem-button"]');
    
    // Verify error
    await expect(userPage.locator('text=Code has expired')).toBeVisible();
    
    await userContext.close();
  });
});
