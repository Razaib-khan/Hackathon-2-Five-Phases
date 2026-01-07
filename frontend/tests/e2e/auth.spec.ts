/**
 * Authentication E2E Tests
 *
 * Tests:
 * - User registration flow
 * - User login flow
 * - Token persistence
 * - Protected route access
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('h1')).toContainText(/login|sign in/i)
  })

  test('should register new user', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    const timestamp = Date.now()
    await page.fill('input[type="email"]', `test${timestamp}@example.com`)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/login')

    // Fill login form (use test credentials)
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Reload page
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Clear storage
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    // Try to access dashboard
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
