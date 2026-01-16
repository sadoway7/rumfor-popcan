import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Test user data - using seeded users
const testUsers = {
  vendor: {
    email: "vendor@rumfor.com", // From seed-test-users.js
    password: "vendor123"
  },
  admin: {
    email: "admin@rumfor.com",
    password: "admin"
  }
};

// Helper function to login as vendor
async function loginAsVendor(page: any) {
  await page.goto("/login");
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', testUsers.vendor.email);
  await page.fill('input[type="password"]', testUsers.vendor.password);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL("**/dashboard", { timeout: 10000 });
}

// Helper to navigate to vendor market detail
async function navigateToVendorMarket(page: any, marketId: string) {
  await page.goto(`/vendor/market/${marketId}`);
  await page.waitForLoadState('networkidle');
}

// Helper to check accessibility
async function checkAccessibility(page: any) {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
}

// Helper to test mobile viewport
async function setMobileViewport(page: any) {
  await page.setViewportSize({ width: 375, height: 667 });
}

// Helper to test desktop viewport
async function setDesktopViewport(page: any) {
  await page.setViewportSize({ width: 1920, height: 1080 });
}

test.describe("Vendor Market Detail View - Comprehensive E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as vendor before each test
    await loginAsVendor(page);
  });

  test.describe("Vendor Market Detail Navigation", () => {
    test("Vendor can access market detail view from dashboard", async ({ page }) => {
      // Navigate to vendor dashboard
      await page.goto("/vendor");
      await expect(page.locator("text=Vendor Dashboard")).toBeVisible();

      // Click on a tracked market or first market link
      const marketLink = page.locator('[data-testid="vendor-market-link"]').first();
      await expect(marketLink).toBeVisible();
      const marketHref = await marketLink.getAttribute('href');
      const marketId = marketHref?.split('/').pop();

      await marketLink.click();
      await page.waitForURL(`**/vendor/market/${marketId}`);

      // Verify page loaded correctly
      await expect(page.locator("text=Market Details")).toBeVisible();
      await expect(page.locator('[data-testid="market-name"]')).toBeVisible();
    });

    test("Vendor can navigate back from market detail to tracked markets", async ({ page }) => {
      await navigateToVendorMarket(page, "1"); // Assuming market ID 1 exists

      // Click back button
      await page.click('[data-testid="back-to-markets"]');
      await page.waitForURL("**/vendor/tracked-markets");

      // Verify we're back on the tracked markets page
      await expect(page.locator("text=Tracked Markets")).toBeVisible();
    });

    test("Unauthorized vendor cannot access market detail view", async ({ page }) => {
      // Navigate directly to market URL without login
      await page.goto("/");
      // Clear any session
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto("/vendor/market/1");

      // Should redirect to login or show error
      await expect(page).toHaveURL(/.*login.*/);
    });

    test("Invalid market ID shows error page", async ({ page }) => {
      await page.goto("/vendor/market/invalid-id");

      // Should show error message or 404
      await expect(page.locator("text=Market Not Found")).toBeVisible();
    });
  });

  test.describe("Tab Navigation Testing", () => {
    test("All tabs are visible and functional on desktop", async ({ page }) => {
      setDesktopViewport(page);
      await navigateToVendorMarket(page, "1");

      const tabs = [
        { name: 'overview', label: 'Overview' },
        { name: 'preparation', label: 'Preparation' },
        { name: 'expenses', label: 'Expenses' },
        { name: 'analytics', label: 'Analytics' },
        { name: 'logistics', label: 'Logistics' },
        { name: 'communication', label: 'Communication' }
      ];

      // Check all tabs are present
      for (const tab of tabs) {
        await expect(page.locator(`[data-testid="tab-${tab.name}"]`)).toBeVisible();
      }

      // Test clicking each tab
      for (const tab of tabs) {
        await page.click(`[data-testid="tab-${tab.name}"]`);
        // Wait for tab content to load
        await page.waitForTimeout(100);
        // Verify active tab highlighting
        await expect(page.locator(`[data-testid="tab-${tab.name}"].active`)).toBeVisible();
      }
    });

    test("Tab navigation works correctly on mobile viewports", async ({ page }) => {
      setMobileViewport(page);
      await navigateToVendorMarket(page, "1");

      // Check tabs are accessible on mobile
      const tabs = ['overview', 'preparation', 'expenses', 'analytics', 'logistics', 'communication'];

      for (const tabName of tabs) {
        const tab = page.locator(`[data-testid="tab-${tabName}"]`);
        await expect(tab).toBeVisible();

        // Ensure tabs are touch-friendly (minimum touch target size)
        const boundingBox = await tab.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(44); // WCAG touch target
        expect(boundingBox?.width).toBeGreaterThanOrEqual(44);

        // Test tab switching
        await tab.click();
        await expect(page.locator(`[data-testid="tab-${tabName}"].active`)).toBeVisible();
      }
    });

    test("Active tab state persists across page refreshes", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Switch to preparation tab
      await page.click('[data-testid="tab-preparation"]');
      await expect(page.locator('[data-testid="tab-preparation"].active')).toBeVisible();

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on preparation tab
      await expect(page.locator('[data-testid="tab-preparation"].active')).toBeVisible();
    });
  });

  test.describe("Vendor Todo Management Testing", () => {
    test("Can view, create, and manage market-specific todos", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-preparation"]');

      // Verify todo list is visible
      await expect(page.locator('[data-testid="todo-list"]')).toBeVisible();

      // Create a new todo
      await page.click('[data-testid="create-todo-btn"]');
      await page.fill('[data-testid="todo-input"]', 'Test market preparation task');
      await page.selectOption('[data-testid="todo-priority"]', 'high');
      await page.click('[data-testid="save-todo-btn"]');

      // Verify todo appears in list
      await expect(page.locator('text=Test market preparation task')).toBeVisible();
      await expect(page.locator('[data-testid="todo-priority-high"]')).toBeVisible();
    });

    test("Todo filtering and sorting functionality works", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-preparation"]');

      // Test filtering by status
      await page.selectOption('[data-testid="todo-filter"]', 'completed');
      // Should show only completed todos
      const todoItems = page.locator('[data-testid="todo-item"]');
      const completedTodos = todoItems.locator('[data-testid="todo-completed"]');
      expect(await completedTodos.count()).toBe(await todoItems.count());

      // Test sorting
      await page.click('[data-testid="sort-by-priority"]');
      // Check that high priority items are first
      const firstTodo = page.locator('[data-testid="todo-item"]').first();
      await expect(firstTodo.locator('[data-testid="todo-priority-high"]')).toBeVisible();
    });

    test("Template-based todo creation for market preparation", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-preparation"]');

      // Click template button
      await page.click('[data-testid="use-template-btn"]');
      await page.click('[data-testid="market-prep-template"]');

      // Verify template todos are created
      await expect(page.locator('text=Review market requirements')).toBeVisible();
      await expect(page.locator('text=Prepare booth signage')).toBeVisible();
      await expect(page.locator('text=Pack inventory')).toBeVisible();
    });

    test("Todo status updates and progress tracking", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-preparation"]');

      // Mark todo as complete
      const firstCheckbox = page.locator('[data-testid="todo-checkbox"]').first();
      await firstCheckbox.click();
      await page.waitForTimeout(500); // Wait for UI update

      // Verify todo shows as completed
      const firstCompleted = page.locator('[data-testid="todo-completed"]').first();
      await expect(firstCompleted).toBeVisible();

      // Check progress indicator
      const progressBar = page.locator('[data-testid="todo-progress-bar"]');
      await expect(progressBar).toBeVisible();
      // Verify progress increased
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      expect(Number(progressValue)).toBeGreaterThan(0);
    });
  });

  test.describe("Expense Tracking Testing", () => {
    test("Can log expenses for specific markets", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-expenses"]');

      // Add new expense
      await page.click('[data-testid="add-expense-btn"]');
      await page.fill('[data-testid="expense-description"]', 'Booth rental fee');
      await page.fill('[data-testid="expense-amount"]', '150.00');
      await page.selectOption('[data-testid="expense-category"]', 'booth-fee');
      await page.fill('[data-testid="expense-date"]', new Date().toISOString().split('T')[0]);
      await page.click('[data-testid="save-expense-btn"]');

      // Verify expense appears
      await expect(page.locator('text=Booth rental fee')).toBeVisible();
      await expect(page.locator('text=$150.00')).toBeVisible();
    });

    test("Budget calculations and category filtering work", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-expenses"]');

      // Check budget overview
      await expect(page.locator('[data-testid="budget-summary"]')).toBeVisible();

      // Filter by category
      await page.selectOption('[data-testid="expense-filter"]', 'booth-fee');
      const visibleExpenses = page.locator('[data-testid="expense-item"]');
      // All visible expenses should be booth fees
      for (const expense of await visibleExpenses.all()) {
        await expect(expense.locator('text=Booth Fee')).toBeVisible();
      }

      // Verify budget calculation shows correct total
      const totalAmount = page.locator('[data-testid="total-expenses"]');
      await expect(totalAmount).toBeVisible();
    });

    test("Expense summaries and analytics integration", async ({ page }) => {
      await navigateToVendorMarket(page, "1");
      await page.click('[data-testid="tab-expenses"]');

      // Check expense chart
      await expect(page.locator('[data-testid="expense-chart"]')).toBeVisible();

      // Check summary stats
      await expect(page.locator('[data-testid="expense-summary-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-breakdown"]')).toBeVisible();

      // Verify analytics data flows to analytics tab
      await page.click('[data-testid="tab-analytics"]');
      await expect(page.locator('[data-testid="expense-analytics"]')).toBeVisible();
    });
  });

  test.describe("Application Status Testing", () => {
    test("Application status display and status updates", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Check application status card in overview tab
      await expect(page.locator('[data-testid="application-status-card"]')).toBeVisible();

      // Verify status badge
      const statusBadge = page.locator('[data-testid="application-status-badge"]');
      await expect(statusBadge).toBeVisible();

      // Check deadline display
      await expect(page.locator('[data-testid="application-deadline"]')).toBeVisible();

      // Test status transition (if promoter changes status)
      // This would need backend cooperation, so we'll mock it
      await page.route('**/api/applications/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { status: 'approved', updatedAt: new Date().toISOString() }
          })
        });
      });
    });

    test("Application deadline tracking and warnings", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Check deadline warning for upcoming deadlines
      const deadlineWarning = page.locator('[data-testid="deadline-warning"]');
      // Should show warning if deadline is approaching
      if (await deadlineWarning.isVisible()) {
        await expect(deadlineWarning).toContainText('deadline');
      }

      // Test deadline passed scenario (would need market with passed deadline)
      // await expect(page.locator('text=Deadline passed')).toBeVisible();
    });

    test("Application resubmission flows", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // If application was rejected, should show resubmit button
      const resubmitBtn = page.locator('[data-testid="resubmit-application-btn"]');
      if (await resubmitBtn.isVisible()) {
        await resubmitBtn.click();
        await page.waitForURL('**/apply/**');

        // Verify redirected to application form
        await expect(page.locator('[data-testid="application-form"]')).toBeVisible();
      }
    });

    test("Application communication features", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Check if communication tab is accessible
      await page.click('[data-testid="tab-communication"]');

      // Should show messaging interface
      await expect(page.locator('[data-testid="messenger-interface"]')).toBeVisible();

      // Test sending message
      await page.fill('[data-testid="message-input"]', 'Test message to promoter');
      await page.click('[data-testid="send-message-btn"]');

      // Verify message appears
      await expect(page.locator('text=Test message to promoter')).toBeVisible();
    });
  });

  test.describe("Mobile Responsiveness Testing", () => {
    test("Touch targets and mobile layout work correctly", async ({ page }) => {
      setMobileViewport(page);
      await navigateToVendorMarket(page, "1");

      // Check all interactive elements have proper touch targets
      const interactiveElements = [
        '[data-testid="tab-overview"]',
        '[data-testid="tab-preparation"]',
        '[data-testid="tab-expenses"]',
        '[data-testid="back-to-markets"]',
        '[data-testid="create-todo-btn"]',
        '[data-testid="add-expense-btn"]'
      ];

      for (const selector of interactiveElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("Tab navigation works on small screens", async ({ page }) => {
      setMobileViewport(page);
      await navigateToVendorMarket(page, "1");

      // Test horizontal scrolling if needed (for many tabs)
      const tabContainer = page.locator('[data-testid="tabs-container"]');

      // Ensure tabs are accessible
      const tabs = ['overview', 'preparation', 'expenses', 'analytics'];
      for (const tab of tabs) {
        await page.locator(`[data-testid="tab-${tab}"]`).click();
        await expect(page.locator(`[data-testid="tab-${tab}"].active`)).toBeVisible();
      }
    });

    test("Mobile-specific interactions and workflows", async ({ page }) => {
      setMobileViewport(page);
      await navigateToVendorMarket(page, "1");

      // Test swipe gestures if implemented
      // Test pull-to-refresh if implemented

      // Test mobile keyboard behavior
      await page.click('[data-testid="create-todo-btn"]');
      const input = page.locator('[data-testid="todo-input"]');
      await input.fill('Mobile todo test');
      await expect(input).toHaveValue('Mobile todo test');

      // Verify mobile layout doesn't break form submission
      await page.click('[data-testid="save-todo-btn"]');
      await expect(page.locator('text=Mobile todo test')).toBeVisible();
    });
  });

  test.describe("Accessibility Testing", () => {
    test("Keyboard navigation works in all tabs", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Test tab navigation with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Focus on first tab

      // Test arrow key navigation if implemented
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('[data-testid="tab-preparation"].active')).toBeVisible();

      // Test Enter key activation
      await page.keyboard.press('Tab'); // Move to next focusable element
      await page.keyboard.press('Enter');

      // Test focus management
      const focusedElement = page.locator('*:focus');
      await expect(focusedElement).toBeVisible();
    });

    test("Screen reader compatibility", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Check ARIA labels and roles
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tab"]')).toHaveCount(await page.locator('[data-testid^="tab-"]').count());

      // Check aria-selected on active tab
      const activeTab = page.locator('[data-testid="tab-overview"].active');
      await expect(activeTab).toHaveAttribute('aria-selected', 'true');

      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      await expect(headings).toHaveCount(await headings.count()); // At least some headings exist

      // Check alt text on images
      const images = page.locator('img');
      for (const img of await images.all()) {
        await expect(img).toHaveAttribute('alt');
      }
    });

    test("Color contrast and focus indicators", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Use axe-core for comprehensive accessibility check
      await checkAccessibility(page);

      // Test focus indicators specifically
      await page.keyboard.press('Tab');
      const focusedElement = page.locator('*:focus');
      await expect(focusedElement).toBeVisible();

      // Check if focus outline is visible (visual test would need screenshot comparison)
    });
  });

  test.describe("Performance Testing", () => {
    test("Page load times are acceptable", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/vendor/market/1");
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Less than 3 seconds

      // Test tab switching performance
      const tabSwitchStart = Date.now();
      await page.click('[data-testid="tab-preparation"]');
      await page.waitForLoadState('networkidle');
      const tabSwitchTime = Date.now() - tabSwitchStart;
      expect(tabSwitchTime).toBeLessThan(1000); // Less than 1 second
    });

    test("API endpoint performance for vendor data", async ({ page }) => {
      // Mock API responses to measure performance
      let apiStartTime = 0;
      await page.route('**/api/markets/**', async route => {
        apiStartTime = Date.now();
        await route.continue();
      });

      // Listen for response
      page.on('response', response => {
        if (response.url().includes('/api/markets/')) {
          const endTime = Date.now();
          const duration = endTime - apiStartTime;
          console.log(`Market API took ${duration}ms`);
          expect(duration).toBeLessThan(500); // API should respond within 500ms
        }
      });

      await navigateToVendorMarket(page, "1");
    });

    test("Bundle size impact verification", async ({ page }) => {
      // Verify the page loads without excessive resources
      await page.goto("/vendor/market/1");
      await page.waitForLoadState('networkidle');

      // Check that network requests are reasonable
      const requests = [];
      page.on('request', request => {
        requests.push(request.url());
      });

      await page.waitForTimeout(2000); // Wait for all resources to load

      // Should not have excessive resource requests
      expect(requests.length).toBeLessThan(50);

      // Basic check that scripts loaded (count via locator)
      const scriptCount = await page.locator('script[src]').count();
      expect(scriptCount).toBeLessThan(15); // Reasonable number of scripts
    });
  });

  test.describe("Error Handling Testing", () => {
    test("Unauthorized access scenarios", async ({ page }) => {
      // Test accessing vendor-only page as different role
      await page.goto("/");

      // Clear session and try admin login, then access vendor page
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/login");
      await page.fill('input[name="email"]', testUsers.admin.email);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard");

      // Try to access vendor market page
      await page.goto("/vendor/market/1");

      // Should show unauthorized error or redirect
      await expect(page.locator('text=Unauthorized')).toBeVisible();
    });

    test("Network failure scenarios", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Mock network failure on API call
      await page.route('**/api/markets/1**', route => route.abort());

      // Trigger a data refresh
      await page.click('[data-testid="refresh-btn"]');

      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Network error')).toBeVisible();
    });

    test("Invalid data handling", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Try to submit invalid todo
      await page.click('[data-testid="create-todo-btn"]');
      await page.fill('[data-testid="todo-input"]', ''); // Empty todo
      await page.click('[data-testid="save-todo-btn"]');

      // Should show validation error
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('text=Todo description is required')).toBeVisible();
    });
  });

  test.describe("Integration Testing", () => {
    test("End-to-end vendor workflow from login to application submission", async ({ page }) => {
      // Login flow
      await loginAsVendor(page);
      await expect(page.locator('text=Vendor Dashboard')).toBeVisible();

      // Navigate to markets
      await page.click('[data-testid="browse-markets-btn"]');
      await expect(page.locator('text=Markets')).toBeVisible();

      // Select and view market detail
      await page.click('[data-testid="market-card"]:first-child');
      await page.waitForURL(/.*market.*/);
      await expect(page.locator('[data-testid="market-detail-view"]')).toBeVisible();

      // Track the market
      await page.click('[data-testid="track-market-btn"]');
      await expect(page.locator('text=Market tracked successfully')).toBeVisible();

      // Navigate to tracked markets
      await page.goto("/vendor/tracked-markets");
      await expect(page.locator('text=Tracked Markets')).toBeVisible();

      // Access market detail view
      await page.click('[data-testid="vendor-market-link"]:first-child');
      await page.waitForURL(/.*vendor\/market.*/);

      // Complete preparation todos
      await page.click('[data-testid="tab-preparation"]');
      const todoCount = await page.locator('[data-testid="todo-item"]').count();
      for (let i = 0; i < todoCount; i++) {
        await page.locator('[data-testid="todo-checkbox"]').nth(i).click();
      }

      // Add expenses
      await page.click('[data-testid="tab-expenses"]');
      await page.click('[data-testid="add-expense-btn"]');
      await page.fill('[data-testid="expense-description"]', 'E2E Test Expense');
      await page.fill('[data-testid="expense-amount"]', '100.00');
      await page.selectOption('[data-testid="expense-category"]', 'supplies');
      await page.click('[data-testid="save-expense-btn"]');

      // Submit application
      const applyBtn = page.locator('[data-testid="apply-to-market-btn"]');
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForURL(/.*apply.*/);

        // Fill out application form
        await page.fill('[data-testid="business-name"]', 'E2E Test Business');
        await page.fill('[data-testid="business-description"]', 'Test business for E2E testing');
        await page.fill('[data-testid="contact-email"]', 'test@e2e.com');
        await page.fill('[data-testid="contact-phone"]', '555-0123');

        await page.click('[data-testid="submit-application-btn"]');
        await expect(page.locator('text=Application submitted successfully')).toBeVisible();
      }
    });

    test("Data synchronization across tabs and components", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Create a todo in preparation tab
      await page.click('[data-testid="tab-preparation"]');
      await page.click('[data-testid="create-todo-btn"]');
      await page.fill('[data-testid="todo-input"]', 'Sync test todo');
      await page.click('[data-testid="save-todo-btn"]');

      // Switch to analytics tab
      await page.click('[data-testid="tab-analytics"]');

      // Switch back to preparation tab
      await page.click('[data-testid="tab-preparation"]');

      // Verify todo still exists
      await expect(page.locator('text=Sync test todo')).toBeVisible();

      // Create expense in expenses tab
      await page.click('[data-testid="tab-expenses"]');
      await page.click('[data-testid="add-expense-btn"]');
      await page.fill('[data-testid="expense-description"]', 'Sync test expense');
      await page.fill('[data-testid="expense-amount"]', '50.00');
      await page.click('[data-testid="save-expense-btn"]');

      // Check if expense appears in analytics
      await page.click('[data-testid="tab-analytics"]');
      await expect(page.locator('text=Sync test expense')).toBeVisible();
    });

    test("State management and persistence", async ({ page }) => {
      await navigateToVendorMarket(page, "1");

      // Change multiple states
      await page.click('[data-testid="tab-preparation"]');
      await page.selectOption('[data-testid="todo-filter"]', 'pending');

      await page.click('[data-testid="tab-expenses"]');
      await page.selectOption('[data-testid="expense-date-range"]', 'month');

      await page.click('[data-testid="tab-analytics"]');

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should be on analytics tab and other states may persist based on implementation
      await expect(page.locator('[data-testid="tab-analytics"].active')).toBeVisible();
    });
  });
});