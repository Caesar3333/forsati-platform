/**
 * Forsati Platform - Audit Logs E2E Tests
 * اختبارات سجلات المراجعة
 */

import { test, expect, waitForTableLoad } from './fixtures';

test.describe('Audit Logs Admin', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-audit-logs"]');
    await waitForTableLoad(adminPage);
  });

  test('should display audit logs list', async ({ adminPage }) => {
    await expect(adminPage.locator('.ant-table')).toBeVisible();
    
    // Verify columns
    await expect(adminPage.locator('th:has-text("Timestamp")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Action")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Actor")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Resource")')).toBeVisible();
  });

  test('should filter logs by category', async ({ adminPage }) => {
    // Select category filter
    await adminPage.click('[data-testid="filter-category"]');
    await adminPage.click('.ant-select-item:has-text("Feature Flags")');
    
    await waitForTableLoad(adminPage);
    
    // Verify all logs are feature flag related
    const actionCells = adminPage.locator('.ant-table-tbody td:nth-child(2) .ant-tag');
    const count = await actionCells.count();
    
    for (let i = 0; i < count; i++) {
      const text = await actionCells.nth(i).textContent();
      expect(text?.toLowerCase()).toMatch(/feature|flag/);
    }
  });

  test('should filter logs by actor email', async ({ adminPage }) => {
    // Search by actor
    await adminPage.fill('[data-testid="filter-actor"]', 'admin@forsati.sa');
    await adminPage.press('[data-testid="filter-actor"]', 'Enter');
    
    await waitForTableLoad(adminPage);
    
    // Verify all logs are from that actor
    const actorCells = adminPage.locator('.ant-table-tbody td:nth-child(3)');
    const count = await actorCells.count();
    
    for (let i = 0; i < count; i++) {
      const text = await actorCells.nth(i).textContent();
      expect(text).toContain('admin@forsati.sa');
    }
  });

  test('should filter logs by date range', async ({ adminPage }) => {
    // Open date range picker
    await adminPage.click('[data-testid="filter-date-range"]');
    
    // Select last 7 days (using preset)
    await adminPage.click('text=Last 7 Days');
    
    await waitForTableLoad(adminPage);
    
    // Verify dates are within range
    const dateCells = adminPage.locator('.ant-table-tbody td:nth-child(1)');
    const count = await dateCells.count();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    for (let i = 0; i < count; i++) {
      const text = await dateCells.nth(i).textContent();
      if (text) {
        const logDate = new Date(text);
        expect(logDate.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime());
      }
    }
  });

  test('should view log details', async ({ adminPage }) => {
    // Click view details on first row
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-view"]').click();
    
    // Verify modal opens
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Verify details are shown
    await expect(adminPage.locator('text=ID')).toBeVisible();
    await expect(adminPage.locator('text=Action')).toBeVisible();
    await expect(adminPage.locator('text=Actor')).toBeVisible();
    await expect(adminPage.locator('text=Resource Type')).toBeVisible();
    
    // Close modal
    await adminPage.click('.ant-modal-close');
    await expect(adminPage.locator('.ant-modal')).toBeHidden();
  });

  test('should show changes before/after in details', async ({ adminPage }) => {
    // Find a log with changes (e.g., an update action)
    await adminPage.click('[data-testid="filter-category"]');
    await adminPage.click('.ant-select-item:has-text("Feature Flags")');
    await waitForTableLoad(adminPage);
    
    // Look for update action
    const updateRow = adminPage.locator('.ant-table-tbody tr:has-text("update")').first();
    await updateRow.locator('[data-testid="action-view"]').click();
    
    // Check for before/after sections
    await expect(adminPage.locator('text=Previous Values')).toBeVisible();
    await expect(adminPage.locator('text=New Values')).toBeVisible();
    
    // Verify JSON is displayed
    await expect(adminPage.locator('pre')).toBeVisible();
    
    await adminPage.click('.ant-modal-close');
  });

  test('should export logs as CSV', async ({ adminPage }) => {
    // Click export button
    const [download] = await Promise.all([
      adminPage.waitForEvent('download'),
      adminPage.click('[data-testid="export-csv"]'),
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('audit_logs');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should export filtered logs', async ({ adminPage }) => {
    // Apply some filters first
    await adminPage.click('[data-testid="filter-category"]');
    await adminPage.click('.ant-select-item:has-text("Gift Codes")');
    await waitForTableLoad(adminPage);
    
    // Export
    const [download] = await Promise.all([
      adminPage.waitForEvent('download'),
      adminPage.click('[data-testid="export-csv"]'),
    ]);
    
    // Read the file content
    const path = await download.path();
    expect(path).not.toBeNull();
  });

  test('should paginate through logs', async ({ adminPage }) => {
    // Get first page data
    const firstRowText = await adminPage.locator('.ant-table-tbody tr').first().textContent();
    
    // Go to next page
    await adminPage.click('.ant-pagination-next');
    await waitForTableLoad(adminPage);
    
    // Verify different data
    const secondPageRowText = await adminPage.locator('.ant-table-tbody tr').first().textContent();
    expect(secondPageRowText).not.toBe(firstRowText);
    
    // Go back
    await adminPage.click('.ant-pagination-prev');
    await waitForTableLoad(adminPage);
    
    const backRowText = await adminPage.locator('.ant-table-tbody tr').first().textContent();
    expect(backRowText).toBe(firstRowText);
  });

  test('should clear all filters', async ({ adminPage }) => {
    // Apply multiple filters
    await adminPage.click('[data-testid="filter-category"]');
    await adminPage.click('.ant-select-item:has-text("Users")');
    await adminPage.fill('[data-testid="filter-actor"]', 'admin@');
    await waitForTableLoad(adminPage);
    
    // Clear filters
    await adminPage.click('[data-testid="clear-filters"]');
    await waitForTableLoad(adminPage);
    
    // Verify filters are cleared
    await expect(adminPage.locator('[data-testid="filter-category"]')).toHaveText('');
    await expect(adminPage.locator('[data-testid="filter-actor"]')).toHaveValue('');
  });
});

test.describe('Audit Logs - Immutability', () => {
  test('should not allow editing or deleting logs', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-audit-logs"]');
    await waitForTableLoad(adminPage);
    
    // Verify no edit/delete buttons exist
    await expect(adminPage.locator('[data-testid="action-edit"]')).toHaveCount(0);
    await expect(adminPage.locator('[data-testid="action-delete"]')).toHaveCount(0);
  });

  test('should record admin actions automatically', async ({ adminPage }) => {
    // Perform an action (toggle a feature flag)
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-feature-flags"]');
    await waitForTableLoad(adminPage);
    
    const toggleSwitch = adminPage.locator('.ant-switch').first();
    await toggleSwitch.click();
    await adminPage.waitForResponse(/\/api\/admin\/feature-flags/);
    
    // Check audit logs
    await adminPage.click('[data-testid="admin-menu-audit-logs"]');
    await waitForTableLoad(adminPage);
    
    // Latest action should be the toggle
    const latestAction = adminPage.locator('.ant-table-tbody tr').first().locator('td:nth-child(2)');
    const actionText = await latestAction.textContent();
    expect(actionText?.toLowerCase()).toContain('feature');
  });
});
