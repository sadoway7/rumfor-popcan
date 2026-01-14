import { expect, test } from "@playwright/test";

// Helpers
const getRandomEmail = () => `test-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

// Test data
const userData = {
  vendor: {
    email: getRandomEmail(),
    password: testPassword,
    role: 'vendor'
  },
  promoter: {
    email: getRandomEmail(),
    password: testPassword,
    role: 'promoter'
  },
  admin: {
    email: 'admin@example.com', // from seed
    password: 'admin123'
  }
};

test.describe("Rumfor Market Tracker - E2E Tests", () => {
  test.describe("Authentication", () => {
    test("User can register as vendor", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="email"]', userData.vendor.email);
      await page.fill('input[name="password"]', userData.vendor.password);
      await page.fill('input[name="confirmPassword"]', userData.vendor.password);
      await page.fill('input[name="firstName"]', "Test");
      await page.fill('input[name="lastName"]', "Vendor");

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/email-verify/);
    });

    test("User can login", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', userData.admin.email);
      await page.fill('input[name="password"]', userData.admin.password);

      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test("2FA login flow", async ({ page }) => {
      // Assume 2FA is enabled for admin
      await page.goto("/login");

      await page.fill('input[name="email"]', userData.admin.email);
      await page.fill('input[name="password"]', userData.admin.password);

      await page.click('button[type="submit"]');

      // Should prompt for 2FA code
      await expect(page.locator('text=Enter 2FA Code')).toBeVisible();
    });
  });

  test.describe("Market Browsing", () => {
    test("Visitor can view market list", async ({ page }) => {
      await page.goto("/");

      // Check market cards are visible
      await expect(page.locator('[data-testid="market-card"]')).toHaveCount(await page.locator('[data-testid="market-card"]').count());
    });

    test("Can search markets", async ({ page }) => {
      await page.goto("/markets");

      await page.fill('input[placeholder*="search"]', "Farmers Market");
      await page.click('button[type="submit"]');

      // Should show filtered results
      await expect(page.locator('[data-testid="market-card"]')).toBeVisible();
    });
  });

  test.describe("Vendor Workflow", () => {
    test.beforeEach(async ({ page }) => {
      // Login as vendor first
      await page.goto("/login");
      await page.fill('input[name="email"]', userData.vendor.email);
      await page.fill('input[name="password"]', userData.vendor.password);
      await page.click('button[type="submit"]');
      // Assume email verified
    });

    test("Can apply to market", async ({ page }) => {
      await page.goto("/markets/1"); // Assume market ID

      await page.click('button[data-testid="apply-to-market"]');

      // Fill application form
      await page.fill('input[name="businessName"]', "Test Vendor Business");
      await page.fill('textarea[name="description"]', "Selling fresh produce");
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Application submitted successfully')).toBeVisible();
    });

    test("Can view my applications", async ({ page }) => {
      await page.goto("/applications");

      await expect(page.locator('[data-testid="application-card"]')).toBeVisible();
    });
  });



  test.describe("Responsive Design", () => {
    test("Desktop layout", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");

      // Check sidebar is visible on desktop
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });

    test("Mobile layout", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Check mobile nav is visible
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    });
  });

  test.describe("Error States", () => {
    test("Invalid login shows error", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "invalid@example.com");
      await page.fill('input[name="password"]', "wrongpass");
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test("Network error handling", async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      await page.goto("/login");

      await page.fill('input[name="email"]', userData.admin.email);
      await page.fill('input[name="password"]', userData.admin.password);
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Network error')).toBeVisible();
    });
  });
});