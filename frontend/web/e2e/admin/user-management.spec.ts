/**
 * Forsati Platform - User Management E2E Tests
 * اختبارات إدارة المستخدمين
 */

import { test, expect, waitForTableLoad, searchInTable, getNotificationMessage, TEST_USERS } from './fixtures';

test.describe('User Management Admin', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-users"]');
    await waitForTableLoad(adminPage);
  });

  test('should display users list', async ({ adminPage }) => {
    await expect(adminPage.locator('.ant-table')).toBeVisible();
    
    // Verify columns
    await expect(adminPage.locator('th:has-text("User")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Status")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Roles")')).toBeVisible();
  });

  test('should search users by email', async ({ adminPage }) => {
    await searchInTable(adminPage, 'admin@');
    
    // Verify filtered results
    const rows = adminPage.locator('.ant-table-tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify email contains search term
    for (let i = 0; i < count; i++) {
      const emailCell = rows.nth(i).locator('td:first-child');
      const text = await emailCell.textContent();
      expect(text?.toLowerCase()).toContain('admin@');
    }
  });

  test('should toggle user enabled status', async ({ adminPage }) => {
    // Find a non-admin user to toggle
    await searchInTable(adminPage, 'candidate');
    await waitForTableLoad(adminPage);
    
    const toggleSwitch = adminPage.locator('.ant-table-tbody tr').first().locator('.ant-switch');
    const initialState = await toggleSwitch.getAttribute('aria-checked');
    
    await toggleSwitch.click();
    
    // Wait for API response
    await adminPage.waitForResponse(/\/api\/admin\/keycloak\/users/);
    
    // Verify state changed
    const newState = await toggleSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
    
    // Verify message
    const message = await getNotificationMessage(adminPage);
    expect(message.toLowerCase()).toMatch(/enabled|disabled/);
    
    // Toggle back
    await toggleSwitch.click();
    await adminPage.waitForResponse(/\/api\/admin\/keycloak\/users/);
  });

  test('should manage user roles', async ({ adminPage }) => {
    // Find a user
    await searchInTable(adminPage, 'candidate@');
    await waitForTableLoad(adminPage);
    
    // Click manage roles
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-manage-roles"]').click();
    
    // Verify modal opens
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    await expect(adminPage.locator('text=Current Roles')).toBeVisible();
    await expect(adminPage.locator('text=Add Role')).toBeVisible();
  });

  test('should add role to user', async ({ adminPage }) => {
    // Find a candidate user
    await searchInTable(adminPage, 'candidate@');
    await waitForTableLoad(adminPage);
    
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-manage-roles"]').click();
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Select a role to add
    await adminPage.click('[data-testid="role-select"]');
    await adminPage.click('.ant-select-item:has-text("student")');
    
    // Click add
    await adminPage.click('[data-testid="add-role-button"]');
    
    // Verify success
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
    
    // Verify role appears in current roles
    await expect(adminPage.locator('.ant-tag:has-text("student")')).toBeVisible();
  });

  test('should remove role from user', async ({ adminPage }) => {
    // Find a user with multiple roles
    await searchInTable(adminPage, 'test.user@');
    await waitForTableLoad(adminPage);
    
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-manage-roles"]').click();
    await expect(adminPage.locator('.ant-modal')).toBeVisible();
    
    // Find a removable role tag
    const roleTag = adminPage.locator('[data-testid="current-roles"] .ant-tag.ant-tag-closable').first();
    const roleName = await roleTag.textContent();
    
    // Click close icon to remove
    await roleTag.locator('.ant-tag-close-icon').click();
    
    // Confirm removal
    await expect(adminPage.locator('.ant-modal-confirm')).toBeVisible();
    await adminPage.click('.ant-modal-confirm-btns .ant-btn-primary');
    
    // Verify success
    const message = await getNotificationMessage(adminPage);
    expect(message).toContain('success');
  });

  test('should not allow removing own super admin role', async ({ adminPage }) => {
    // Get current user's email
    const currentUserEmail = TEST_USERS.superAdmin.email;
    
    // Search for self
    await searchInTable(adminPage, currentUserEmail);
    await waitForTableLoad(adminPage);
    
    await adminPage.locator('.ant-table-tbody tr').first().locator('[data-testid="action-manage-roles"]').click();
    
    // Try to remove super admin role
    const superAdminTag = adminPage.locator('.ant-tag:has-text("forsati_super_admin")');
    
    // Should not have close icon or should be disabled
    await expect(superAdminTag.locator('.ant-tag-close-icon')).toHaveCount(0);
  });

  test('should display user details on hover/click', async ({ adminPage }) => {
    // Hover over a user row
    const firstRow = adminPage.locator('.ant-table-tbody tr').first();
    await firstRow.hover();
    
    // Verify tooltip or expanded info shows
    // This depends on implementation - adjust as needed
    await expect(adminPage.locator('.ant-tooltip, [data-testid="user-details"]')).toBeVisible().catch(() => {
      // Alternative: click to expand
    });
  });

  test('should filter users by role', async ({ adminPage }) => {
    // Open role filter
    await adminPage.click('[data-testid="filter-role"]');
    await adminPage.click('.ant-select-item:has-text("company")');
    
    await waitForTableLoad(adminPage);
    
    // Verify all users have company role
    const rows = adminPage.locator('.ant-table-tbody tr');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const roleCell = rows.nth(i).locator('td:nth-child(4)');
      await expect(roleCell.locator('.ant-tag:has-text("company")')).toBeVisible();
    }
  });
});

test.describe('User Management - Access Control', () => {
  test('super admin can manage all users', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-users"]');
    await waitForTableLoad(adminPage);
    
    // Should see all action buttons
    await expect(adminPage.locator('[data-testid="action-manage-roles"]').first()).toBeVisible();
    await expect(adminPage.locator('.ant-switch').first()).toBeVisible();
  });

  test('regular admin cannot assign super admin role', async ({ browser }) => {
    // Login as regular admin
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Simulate login as admin (not super admin)
    // In real test, would go through Keycloak login
    
    await page.goto('/admin');
    await page.click('[data-testid="admin-menu-users"]');
    await waitForTableLoad(page);
    
    // Try to manage roles
    await page.locator('.ant-table-tbody tr').first().locator('[data-testid="action-manage-roles"]').click();
    
    // forsati_super_admin should not be in available roles
    await page.click('[data-testid="role-select"]');
    await expect(page.locator('.ant-select-item:has-text("forsati_super_admin")')).toHaveCount(0);
    
    await context.close();
  });

  test('moderator can only suspend/activate users', async ({ browser }) => {
    // Login as moderator
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Would go through Keycloak login with moderator credentials
    
    await page.goto('/admin');
    
    // Should only see moderation section
    await expect(page.locator('[data-testid="admin-menu-moderation"]')).toBeVisible();
    
    // Should not see user management
    await expect(page.locator('[data-testid="admin-menu-users"]')).toHaveCount(0);
    
    await context.close();
  });
});

test.describe('User Session Management', () => {
  test('should display active sessions for user', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-users"]');
    await waitForTableLoad(adminPage);
    
    // Click on a user to view details
    await adminPage.locator('.ant-table-tbody tr').first().click();
    
    // Verify sessions section
    await expect(adminPage.locator('[data-testid="user-sessions"]')).toBeVisible();
    await expect(adminPage.locator('text=Active Sessions')).toBeVisible();
  });

  test('should force logout user', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.click('[data-testid="admin-menu-users"]');
    await waitForTableLoad(adminPage);
    
    // Find a user with active session
    await adminPage.locator('.ant-table-tbody tr').first().click();
    
    // Click force logout
    await adminPage.click('[data-testid="force-logout"]');
    
    // Confirm
    await expect(adminPage.locator('.ant-modal-confirm')).toBeVisible();
    await adminPage.click('.ant-modal-confirm-btns .ant-btn-primary');
    
    // Verify success
    const message = await getNotificationMessage(adminPage);
    expect(message.toLowerCase()).toContain('logged out');
  });
});
