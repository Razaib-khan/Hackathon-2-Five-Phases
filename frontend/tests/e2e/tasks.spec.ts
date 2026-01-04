/**
 * Task CRUD E2E Tests
 *
 * Tests:
 * - Create task
 * - Edit task
 * - Delete task
 * - Toggle completion
 * - View task details
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

test.describe('Task Management', () => {
  test('should create a new task', async ({ page }) => {
    // Click "New Task" button
    await page.click('button:has-text("New Task")')

    // Wait for create dialog
    await expect(page.locator('h2:has-text("Create Task")')).toBeVisible()

    // Fill task details
    const taskTitle = `Test Task ${Date.now()}`
    await page.fill('input[name="title"]', taskTitle)
    await page.fill('textarea[name="description"]', 'Test task description')

    // Select priority
    await page.selectOption('select[name="priority"]', 'high')

    // Submit
    await page.click('button:has-text("Create")')

    // Verify task appears in list
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible()
  })

  test('should toggle task completion', async ({ page }) => {
    // Find first task checkbox
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.waitFor()

    // Get initial state
    const wasChecked = await checkbox.isChecked()

    // Toggle
    await checkbox.click()

    // Verify state changed
    await expect(checkbox).toHaveProperty('checked', !wasChecked)
  })

  test('should edit task details', async ({ page }) => {
    // Click on first task
    await page.click('.task-card:first-of-type')

    // Wait for task details dialog
    await expect(page.locator('h2:has-text("Task Details")')).toBeVisible()

    // Edit title
    const newTitle = `Updated Task ${Date.now()}`
    await page.fill('input[name="title"]', newTitle)

    // Save
    await page.click('button:has-text("Save")')

    // Verify updated title appears
    await expect(page.locator(`text=${newTitle}`)).toBeVisible()
  })

  test('should delete task', async ({ page }) => {
    // Get task count before deletion
    const tasksBefore = await page.locator('.task-card').count()

    // Click on first task
    await page.click('.task-card:first-of-type')

    // Wait for task details dialog
    await expect(page.locator('h2:has-text("Task Details")')).toBeVisible()

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify task count decreased
    const tasksAfter = await page.locator('.task-card').count()
    expect(tasksAfter).toBe(tasksBefore - 1)
  })

  test('should filter tasks by priority', async ({ page }) => {
    // Open filter panel
    await page.click('button[title="Filter"]')

    // Select "High" priority filter
    await page.check('input[value="high"]')

    // Verify only high priority tasks are shown
    const visibleTasks = page.locator('.task-card')
    const count = await visibleTasks.count()

    for (let i = 0; i < count; i++) {
      const task = visibleTasks.nth(i)
      await expect(task.locator('.priority-badge')).toHaveText(/high/i)
    }
  })

  test('should switch between view modes', async ({ page }) => {
    // Start in list view
    await expect(page.locator('.list-view')).toBeVisible()

    // Switch to kanban
    await page.click('button:has-text("Kanban")')
    await expect(page.locator('.kanban-view')).toBeVisible()

    // Switch to calendar
    await page.click('button:has-text("Calendar")')
    await expect(page.locator('.calendar-view')).toBeVisible()

    // Switch to matrix
    await page.click('button:has-text("Matrix")')
    await expect(page.locator('.matrix-view')).toBeVisible()
  })
})
