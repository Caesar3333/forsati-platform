/**
 * Forsati Platform - Admin E2E Test Fixtures
 * إعدادات اختبارات المشرف
 */

import { test as base, expect, Page, BrowserContext } from '@playwright/test';

// ============================================
// Types
// ============================================

export interface AdminUser {
  email: string;
  password: string;
  roles: string[];
}

export interface TestFixtures {
  adminPage: Page;
  adminUser: AdminUser;
  authenticatedContext: BrowserContext;
}

// ============================================
// Test Users
// ============================================

export const TEST_USERS = {
  superAdmin: {
    email: process.env.TEST_SUPER_ADMIN_EMAIL || 'super.admin@forsati.sa',
    password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'SuperAdmin123!',
    roles: ['forsati_super_admin'],
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@forsati.sa',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
    roles: ['forsati_admin'],
  },
  moderator: {
    email: process.env.TEST_MODERATOR_EMAIL || 'moderator@forsati.sa',
    password: process.env.TEST_MODERATOR_PASSWORD || 'Moderator123!',
    roles: ['forsati_moderator'],
  },
  candidate: {
    email: process.env.TEST_CANDIDATE_EMAIL || 'candidate@example.com',
    password: process.env.TEST_CANDIDATE_PASSWORD || 'Candidate123!',
    roles: ['candidate'],
  },
};

// ============================================
// Custom Test Fixture
// ============================================

export const test = base.extend<TestFixtures>({
  adminUser: [TEST_USERS.superAdmin, { option: true }],

  authenticatedContext: async ({ browser, adminUser }, use) => {
    // Create a new context with authentication
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login via Keycloak
    await loginToKeycloak(page, adminUser);

    // Store auth state
    await context.storageState({ path: '.auth/admin.json' });

    await use(context);
    await context.close();
  },

  adminPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect };

// ============================================
// Helper Functions
// ============================================

/**
 * Login to Keycloak
 */
async function loginToKeycloak(page: Page, user: AdminUser) {
  const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  const realm = process.env.KEYCLOAK_REALM || 'forsati';

  // Navigate to admin page which will redirect to Keycloak
  await page.goto('/admin');

  // Wait for Keycloak login page
  await page.waitForURL(/.*keycloak.*login-actions.*/, { timeout: 10000 }).catch(() => {
    // Already logged in or using mock auth
  });

  // Check if we're on Keycloak login page
  const isKeycloakLogin = page.url().includes('login-actions');
  
  if (isKeycloakLogin) {
    // Fill credentials
    await page.fill('#username', user.email);
    await page.fill('#password', user.password);
    await page.click('#kc-login');

    // Wait for redirect back to app
    await page.waitForURL('**/admin/**', { timeout: 15000 });
  }
}

/**
 * Navigate to admin section
 */
export async function navigateToAdminSection(page: Page, section: string) {
  await page.click(`[data-testid="admin-menu-${section}"]`);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for table to load
 */
export async function waitForTableLoad(page: Page) {
  await page.waitForSelector('.ant-table-tbody', { state: 'visible' });
  await page.waitForSelector('.ant-spin', { state: 'hidden' }).catch(() => {});
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  await waitForTableLoad(page);
  const rows = await page.locator('.ant-table-tbody tr').count();
  return rows;
}

/**
 * Search in table
 */
export async function searchInTable(page: Page, searchText: string) {
  await page.fill('[data-testid="search-input"]', searchText);
  await page.waitForTimeout(500); // Debounce
  await waitForTableLoad(page);
}

/**
 * Click action button in table row
 */
export async function clickRowAction(page: Page, rowIndex: number, action: string) {
  const row = page.locator('.ant-table-tbody tr').nth(rowIndex);
  await row.locator(`[data-testid="action-${action}"]`).click();
}

/**
 * Fill form field
 */
export async function fillFormField(page: Page, fieldName: string, value: string) {
  const field = page.locator(`[data-testid="form-${fieldName}"]`);
  await field.fill(value);
}

/**
 * Submit form
 */
export async function submitForm(page: Page) {
  await page.click('[data-testid="submit-button"]');
  await page.waitForSelector('.ant-message', { state: 'visible' });
}

/**
 * Confirm modal action
 */
export async function confirmModalAction(page: Page) {
  await page.click('.ant-modal-confirm-btns .ant-btn-primary');
  await page.waitForSelector('.ant-modal', { state: 'hidden' });
}

/**
 * Get notification message
 */
export async function getNotificationMessage(page: Page): Promise<string> {
  const message = await page.locator('.ant-message-notice-content').textContent();
  return message || '';
}
