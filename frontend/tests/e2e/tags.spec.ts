/**
 * Tag Management E2E Tests
 *
 * Tests:
 * - Create tags
 * - Apply tags to tasks
 * - Filter by tags
 * - Edit tag color/name
 * - Delete tags
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

test.describe('Tag Management', () => {
  test('should create a new tag', async ({ page }) => {
    // Open tag manager
    await page.click('button[title*="Settings"]')

    // Wait for tag manager panel
    await expect(page.locator('h2:has-text("Tags")')).toBeVisible()

    // Click "Add Tag" button
    await page.click('button:has-text("Add Tag")')

    // Fill tag details
    const tagName = `Test Tag ${Date.now()}`
    await page.fill('input[name="name"]', tagName)
    await page.click('button[aria-label="blue"]') // Select blue color

    // Submit
    await page.click('button:has-text("Create")')

    // Verify tag appears in list
    await expect(page.locator(`text=${tagName}`)).toBeVisible()
  })

  test('should apply tag to task', async ({ page }) => {
    // Click on first task
    await page.click('.task-card:first-of-type')

    // Wait for task details dialog
    await expect(page.locator('h2:has-text("Task Details")')).toBeVisible()

    // Open tag selector
    await page.click('button:has-text("Add Tag")')

    // Select first tag
    await page.click('.tag-option:first-of-type')

    // Verify tag appears on task
    await expect(page.locator('.task-tag').first()).toBeVisible()
  })

  test('should filter tasks by tag', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Wait for filter panel
    await expect(page.locator('h3:has-text("Tags")')).toBeVisible()

    // Select a tag filter
    await page.click('.tag-filter-option:first-of-type')

    // Close filter panel
    await page.click('button[title="Close"]')

    // Verify only tasks with selected tag are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    // Each visible task should have the selected tag
    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      await expect(task.locator('.task-tag')).toBeVisible()
    }
  })

  test('should edit tag name and color', async ({ page }) => {
    // Open tag manager
    await page.click('button[title*="Settings"]')

    // Click edit on first tag
    await page.click('.tag-item:first-of-type button[title="Edit"]')

    // Update tag name
    const newName = `Updated Tag ${Date.now()}`
    await page.fill('input[name="name"]', newName)

    // Change color
    await page.click('button[aria-label="green"]')

    // Save changes
    await page.click('button:has-text("Save")')

    // Verify updated name appears
    await expect(page.locator(`text=${newName}`)).toBeVisible()
  })

  test('should delete tag', async ({ page }) => {
    // Open tag manager
    await page.click('button[title*="Settings"]')

    // Get tag count before deletion
    const tagsBefore = await page.locator('.tag-item').count()

    // Click delete on first tag
    await page.click('.tag-item:first-of-type button[title="Delete"]')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify tag count decreased
    const tagsAfter = await page.locator('.tag-item').count()
    expect(tagsAfter).toBe(tagsBefore - 1)
  })

  test('should filter multiple tags with AND logic', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select multiple tags
    await page.click('.tag-filter-option:nth-of-type(1)')
    await page.click('.tag-filter-option:nth-of-type(2)')

    // Toggle AND logic
    await page.click('input[value="and"]')

    // Close filter panel
    await page.click('button[title="Close"]')

    // Verify only tasks with ALL selected tags are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      const tags = task.locator('.task-tag')
      const tagCount = await tags.count()
      expect(tagCount).toBeGreaterThanOrEqual(2)
    }
  })

  test('should show tag usage count', async ({ page }) => {
    // Open tag manager
    await page.click('button[title*="Settings"]')

    // Verify each tag shows usage count
    const tagItems = page.locator('.tag-item')
    const count = await tagItems.count()

    for (let i = 0; i < count; i++) {
      const tag = tagItems.nth(i)
      await expect(tag.locator('.tag-usage-count')).toBeVisible()
    }
  })
})
