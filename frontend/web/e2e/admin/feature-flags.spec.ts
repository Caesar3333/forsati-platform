/**
 * Forsati Platform - Feature Flags E2E Tests
 * اختبارات أعلام الميزات
 */

import { test, expect, waitForTableLoad, searchInTable, getNotificationMessage } from './fixtures';

test.describe('Feature Flags Admin', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-feature-flags"]');
    await waitForTableLoad(adminPage);
  });

  test('should display feature flags list', async ({ adminPage }) => {
    // Verify table is displayed
    await expect(adminPage.locator('.ant-table')).toBeVisible();
    
    // Verify some flags are present
    const rowCount = await adminPage.locator('.ant-table-tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should filter feature flags by search', async ({ adminPage }) => {
    // Get initial count
    const initialCount = await adminPage.locator('.ant-table-tbody tr').count();
    
    // Search for specific flag
    await searchInTable(adminPage, 'cv_scan');
    
    // Verify filtered results
    const filteredCount = await adminPage.locator('.ant-table-tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Verify the searched flag is present
    await expect(adminPage.locator('text=cv_scan')).toBeVisible();
  });

  test('should toggle feature flag', async ({ adminPage }) => {
    // Find a toggle switch
    const toggleSwitch = adminPage.locator('.ant-switch').first();
    const initialState = await toggleSwitch.getAttribute('aria-checked');
    
    // Click to toggle
    await toggleSwitch.click();
    
    // Wait for API response
    await adminPage.waitForResponse(/\/api\/admin\/feature-flags/);
    
    // Verify state changed
    const newState = await toggleSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
    
    // Verify success message
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should create new feature flag', async ({ adminPage }) => {
    // Click create button
    await adminPage.click('[data-testid="create-feature-flag"]');
    
    // Wait for modal
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Fill form
    const timestamp = Date.now();
    await adminPage.fill('[data-testid="form-key"]', `test_flag_${timestamp}`);
    await adminPage.fill('[data-testid="form-name_en"]', 'Test Feature Flag');
    await adminPage.fill('[data-testid="form-name_ar"]', 'علم ميزة تجريبي');
    await adminPage.fill('[data-testid="form-description_en"]', 'A test feature flag');
    await adminPage.fill('[data-testid="form-description_ar"]', 'علم ميزة للاختبار');
    
    // Select markets
    await adminPage.click('[data-testid="form-markets"] .ant-checkbox-input[value="SA"]');
    
    // Submit
    await adminPage.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should edit feature flag', async ({ adminPage }) => {
    // Click edit button on first row
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-edit"]').click();
    
    // Wait for modal
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Update description
    const newDescription = `Updated description ${Date.now()}`;
    await adminPage.fill('[data-testid="form-description_en"]', newDescription);
    
    // Submit
    await adminPage.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should delete feature flag (super admin only)', async ({ adminPage }) => {
    // Create a flag to delete first
    await adminPage.click('[data-testid="create-feature-flag"]');
    const timestamp = Date.now();
    await adminPage.fill('[data-testid="form-key"]', `delete_test_${timestamp}`);
    await adminPage.fill('[data-testid="form-name_en"]', 'Delete Test');
    await adminPage.fill('[data-testid="form-name_ar"]', 'اختبار الحذف');
    await adminPage.click('[data-testid="submit-button"]');
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
    
    // Search for the new flag
    await searchInTable(adminPage, `delete_test_${timestamp}`);
    
    // Click delete
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-delete"]').click();
    
    // Confirm deletion
    await expect(adminPage.locator('.ant-modal-confirm')).toBeVisible();
    await adminPage.click('.ant-modal-confirm-btns .ant-btn-primary');
    
    // Verify success
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should filter by enabled status', async ({ adminPage }) => {
    // Click enabled filter
    await adminPage.click('.ant-table-filter-trigger');
    await adminPage.click('text=Enabled');
    await adminPage.click('button:has-text("OK")');
    
    await waitForTableLoad(adminPage);
    
    // Verify all visible flags are enabled
    const switches = adminPage.locator('.ant-table-tbody .ant-switch');
    const count = await switches.count();
    
    for (let i = 0; i < count; i++) {
      const checked = await switches.nth(i).getAttribute('aria-checked');
      expect(checked).toBe('true');
    }
  });
});

test.describe('Feature Flags - Access Control', () => {
  test('should deny access to non-admin users', async ({ browser }) => {
    // Create new context without admin auth
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Try to access admin page directly
    const response = await page.goto('/api/admin/feature-flags');
    
    // Should get 401 or redirect to login
    expect(response?.status()).toBe(401);
    
    await context.close();
  });
});
