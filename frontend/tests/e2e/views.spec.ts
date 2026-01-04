/**
 * View Switching and Features E2E Tests
 *
 * Tests:
 * - Switch between views
 * - List view features
 * - Kanban drag-and-drop
 * - Calendar date selection
 * - Matrix quadrant navigation
 * - View-specific keyboard shortcuts
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

test.describe('View Switching', () => {
  test('should switch to list view with keyboard shortcut', async ({ page }) => {
    // Start in another view
    await page.click('button:has-text("Kanban")')
    await expect(page.locator('.kanban-view')).toBeVisible()

    // Press '1' to switch to list
    await page.keyboard.press('1')

    // Verify list view is shown
    await expect(page.locator('.list-view')).toBeVisible()
  })

  test('should switch to kanban view with keyboard shortcut', async ({ page }) => {
    // Start in list view
    await expect(page.locator('.list-view')).toBeVisible()

    // Press '2' to switch to kanban
    await page.keyboard.press('2')

    // Verify kanban view is shown
    await expect(page.locator('.kanban-view')).toBeVisible()
  })

  test('should switch to calendar view with keyboard shortcut', async ({ page }) => {
    // Press '3' to switch to calendar
    await page.keyboard.press('3')

    // Verify calendar view is shown
    await expect(page.locator('.calendar-view')).toBeVisible()
  })

  test('should switch to matrix view with keyboard shortcut', async ({ page }) => {
    // Press '4' to switch to matrix
    await page.keyboard.press('4')

    // Verify matrix view is shown
    await expect(page.locator('.matrix-view')).toBeVisible()
  })

  test('should persist view preference across sessions', async ({ page }) => {
    // Switch to kanban view
    await page.click('button:has-text("Kanban")')
    await expect(page.locator('.kanban-view')).toBeVisible()

    // Reload page
    await page.reload()

    // Verify still in kanban view
    await expect(page.locator('.kanban-view')).toBeVisible()
  })
})

test.describe('List View Features', () => {
  test('should sort tasks by priority', async ({ page }) => {
    // Ensure we're in list view
    await page.keyboard.press('1')

    // Click sort by priority
    await page.click('button:has-text("Sort")')
    await page.click('button:has-text("Priority")')

    // Verify first task has high priority
    const firstTask = page.locator('.task-card:first-of-type')
    await expect(firstTask.locator('.priority-badge')).toHaveText(/high/i)
  })

  test('should sort tasks by due date', async ({ page }) => {
    // Ensure we're in list view
    await page.keyboard.press('1')

    // Click sort by due date
    await page.click('button:has-text("Sort")')
    await page.click('button:has-text("Due Date")')

    // Verify tasks are sorted (first task should have soonest due date)
    const firstTask = page.locator('.task-card:first-of-type')
    await expect(firstTask.locator('.due-date')).toBeVisible()
  })

  test('should group tasks by status', async ({ page }) => {
    // Ensure we're in list view
    await page.keyboard.press('1')

    // Click group by status
    await page.click('button:has-text("Group")')
    await page.click('button:has-text("Status")')

    // Verify group headers are shown
    await expect(page.locator('h3:has-text("Incomplete")')).toBeVisible()
    await expect(page.locator('h3:has-text("Completed")')).toBeVisible()
  })
})

test.describe('Kanban View Features', () => {
  test('should show tasks in correct columns', async ({ page }) => {
    // Switch to kanban view
    await page.keyboard.press('2')

    // Verify column headers
    await expect(page.locator('h3:has-text("To Do")')).toBeVisible()
    await expect(page.locator('h3:has-text("In Progress")')).toBeVisible()
    await expect(page.locator('h3:has-text("Done")')).toBeVisible()
  })

  test('should drag task between columns', async ({ page }) => {
    // Switch to kanban view
    await page.keyboard.press('2')

    // Get first task in "To Do" column
    const todoColumn = page.locator('.kanban-column:has(h3:has-text("To Do"))')
    const task = todoColumn.locator('.task-card').first()

    // Get task title for verification
    const taskTitle = await task.locator('.task-title').textContent()

    // Drag to "In Progress" column
    const inProgressColumn = page.locator('.kanban-column:has(h3:has-text("In Progress"))')
    await task.dragTo(inProgressColumn)

    // Verify task appears in "In Progress" column
    await expect(inProgressColumn.locator(`text=${taskTitle}`)).toBeVisible()
  })

  test('should show task count in column headers', async ({ page }) => {
    // Switch to kanban view
    await page.keyboard.press('2')

    // Verify each column shows count
    const todoHeader = page.locator('.kanban-column:has(h3:has-text("To Do")) .task-count')
    await expect(todoHeader).toBeVisible()

    const inProgressHeader = page.locator('.kanban-column:has(h3:has-text("In Progress")) .task-count')
    await expect(inProgressHeader).toBeVisible()

    const doneHeader = page.locator('.kanban-column:has(h3:has-text("Done")) .task-count')
    await expect(doneHeader).toBeVisible()
  })
})

test.describe('Calendar View Features', () => {
  test('should show current month', async ({ page }) => {
    // Switch to calendar view
    await page.keyboard.press('3')

    // Verify current month is shown
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible()
  })

  test('should navigate to next month', async ({ page }) => {
    // Switch to calendar view
    await page.keyboard.press('3')

    // Click next month button
    await page.click('button[aria-label="Next month"]')

    // Verify month changed
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const expectedMonth = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
    await expect(page.locator(`text=${expectedMonth}`)).toBeVisible()
  })

  test('should navigate to previous month', async ({ page }) => {
    // Switch to calendar view
    await page.keyboard.press('3')

    // Click previous month button
    await page.click('button[aria-label="Previous month"]')

    // Verify month changed
    const prevMonth = new Date()
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const expectedMonth = prevMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
    await expect(page.locator(`text=${expectedMonth}`)).toBeVisible()
  })

  test('should show tasks on correct dates', async ({ page }) => {
    // Switch to calendar view
    await page.keyboard.press('3')

    // Click on a date cell
    const dateCell = page.locator('.calendar-date:has(.task-indicator)').first()
    await dateCell.click()

    // Verify tasks for that date are shown
    await expect(page.locator('.date-tasks-popover')).toBeVisible()
  })

  test('should create task on date click', async ({ page }) => {
    // Switch to calendar view
    await page.keyboard.press('3')

    // Double-click a date
    const dateCell = page.locator('.calendar-date').nth(15)
    await dateCell.dblclick()

    // Verify create task dialog opens with pre-filled date
    await expect(page.locator('h2:has-text("Create Task")')).toBeVisible()
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(/.+/)
  })
})

test.describe('Matrix View Features', () => {
  test('should show all four quadrants', async ({ page }) => {
    // Switch to matrix view
    await page.keyboard.press('4')

    // Verify all quadrants are visible
    await expect(page.locator('h3:has-text("Urgent & Important")')).toBeVisible()
    await expect(page.locator('h3:has-text("Not Urgent & Important")')).toBeVisible()
    await expect(page.locator('h3:has-text("Urgent & Not Important")')).toBeVisible()
    await expect(page.locator('h3:has-text("Not Urgent & Not Important")')).toBeVisible()
  })

  test('should categorize tasks by urgency and importance', async ({ page }) => {
    // Switch to matrix view
    await page.keyboard.press('4')

    // Verify high priority tasks are in "Urgent & Important"
    const urgentImportant = page.locator('.matrix-quadrant:has(h3:has-text("Urgent & Important"))')
    const tasks = urgentImportant.locator('.task-card')
    const count = await tasks.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const task = tasks.nth(i)
        await expect(task.locator('.priority-badge')).toHaveText(/high/i)
      }
    }
  })

  test('should show task count in each quadrant', async ({ page }) => {
    // Switch to matrix view
    await page.keyboard.press('4')

    // Verify each quadrant shows count
    const quadrants = page.locator('.matrix-quadrant')
    const count = await quadrants.count()

    expect(count).toBe(4)

    for (let i = 0; i < count; i++) {
      const quadrant = quadrants.nth(i)
      await expect(quadrant.locator('.quadrant-count')).toBeVisible()
    }
  })

  test('should drag task between quadrants', async ({ page }) => {
    // Switch to matrix view
    await page.keyboard.press('4')

    // Get first task in any quadrant
    const task = page.locator('.task-card').first()
    const taskTitle = await task.locator('.task-title').textContent()

    // Drag to different quadrant
    const targetQuadrant = page.locator('.matrix-quadrant').nth(1)
    await task.dragTo(targetQuadrant)

    // Verify task appears in target quadrant
    await expect(targetQuadrant.locator(`text=${taskTitle}`)).toBeVisible()
  })
})
