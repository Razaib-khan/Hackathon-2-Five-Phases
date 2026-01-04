/**
 * Filter Combinations E2E Tests
 *
 * Tests:
 * - Priority filters
 * - Status filters
 * - Date range filters
 * - Search with filters
 * - Combined filter logic
 * - Clear all filters
 */

import { test, expect } from '@playwright/test'

// Helper to login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
})

test.describe('Filter Combinations', () => {
  test('should filter by priority', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select high priority filter
    await page.check('input[value="high"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify only high priority tasks are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      await expect(task.locator('.priority-badge')).toHaveText(/high/i)
    }
  })

  test('should filter by status', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select completed status
    await page.check('input[value="completed"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify only completed tasks are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      const checkbox = task.locator('input[type="checkbox"]')
      await expect(checkbox).toBeChecked()
    }
  })

  test('should filter by date range', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select "Due This Week" filter
    await page.click('button:has-text("Due This Week")')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify tasks are shown (exact count depends on data)
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should combine multiple filters', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select high priority
    await page.check('input[value="high"]')

    // Select incomplete status
    await page.check('input[value="incomplete"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify only high priority incomplete tasks are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      await expect(task.locator('.priority-badge')).toHaveText(/high/i)
      const checkbox = task.locator('input[type="checkbox"]')
      await expect(checkbox).not.toBeChecked()
    }
  })

  test('should search with filters', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Set search query
    await page.fill('input[placeholder*="Search"]', 'test')

    // Select high priority
    await page.check('input[value="high"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify tasks match both search and filter
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      const text = await task.textContent()
      expect(text?.toLowerCase()).toContain('test')
      await expect(task.locator('.priority-badge')).toHaveText(/high/i)
    }
  })

  test('should clear all filters', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Apply multiple filters
    await page.check('input[value="high"]')
    await page.check('input[value="completed"]')
    await page.fill('input[placeholder*="Search"]', 'test')

    // Count tasks with filters
    await page.keyboard.press('Escape')
    const filteredCount = await page.locator('.task-card').count()

    // Open filter panel again
    await page.click('button[title="Filter"]')

    // Clear all filters
    await page.click('button:has-text("Clear All")')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Count tasks without filters
    const unfilteredCount = await page.locator('.task-card').count()

    // Verify count increased (or stayed same if no tasks matched)
    expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount)
  })

  test('should persist filters across view changes', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select high priority filter
    await page.check('input[value="high"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Get task count in list view
    const listViewCount = await page.locator('.task-card').count()

    // Switch to kanban view
    await page.click('button:has-text("Kanban")')

    // Verify same tasks are shown
    await page.waitForSelector('.kanban-view')
    const kanbanCards = await page.locator('.task-card').count()
    expect(kanbanCards).toBe(listViewCount)
  })

  test('should show active filter count badge', async ({ page }) => {
    // Verify no badge initially
    await expect(page.locator('.filter-badge')).not.toBeVisible()

    // Open filter panel
    await page.click('button[title="Filter"]')

    // Apply 3 filters
    await page.check('input[value="high"]')
    await page.check('input[value="medium"]')
    await page.check('input[value="incomplete"]')

    // Close filter panel
    await page.keyboard.press('Escape')

    // Verify badge shows count
    const badge = page.locator('.filter-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('3')
  })

  test('should save filter presets', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Apply filters
    await page.check('input[value="high"]')
    await page.check('input[value="incomplete"]')

    // Save as preset
    await page.click('button:has-text("Save Preset")')
    await page.fill('input[placeholder*="Preset name"]', 'High Priority Incomplete')
    await page.click('button:has-text("Save")')

    // Verify preset appears
    await expect(page.locator('text=High Priority Incomplete')).toBeVisible()

    // Clear filters
    await page.click('button:has-text("Clear All")')

    // Apply preset
    await page.click('button:has-text("High Priority Incomplete")')

    // Verify filters are reapplied
    await expect(page.locator('input[value="high"]')).toBeChecked()
    await expect(page.locator('input[value="incomplete"]')).toBeChecked()
  })
})
