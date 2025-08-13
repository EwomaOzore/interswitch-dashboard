import { test, expect } from "@playwright/test";

test.describe("Banking Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
  });

  test("complete banking flow: login -> view accounts -> view transactions -> transfer funds", async ({
    page,
  }) => {
    // Login
    await page.fill('[data-testid="email"]', "test@interswitch.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();

    // Verify accounts are displayed
    await expect(page.getByText("Savings")).toBeVisible();
    await expect(page.getByText("Current")).toBeVisible();

    // Click on first account to view transactions
    const firstAccount = page.getByRole("button").first();
    await firstAccount.click();

    // Wait for transactions page to load
    await expect(page.getByText("Transaction History")).toBeVisible();

    // Verify transactions are displayed
    await expect(
      page.getByText(/online purchase|salary credit/i),
    ).toBeVisible();

    // Test CSV export
    await page.click('[data-testid="export-csv"]');

    // Start transfer
    await page.click('[data-testid="transfer-button"]');
    await expect(page.getByText("Transfer Funds")).toBeVisible();

    // Fill transfer form
    await page.selectOption('[data-testid="source-account"]', { index: 1 });
    await page.fill('[data-testid="beneficiary-account"]', "1111111111");
    await page.fill('[data-testid="amount"]', "5000");
    await page.fill('[data-testid="description"]', "E2E Test Transfer");
    await page.fill('[data-testid="pin"]', "1234");

    // Submit transfer
    await page.click('[data-testid="transfer-submit"]');

    // Verify confirmation modal
    await expect(page.getByText("Confirm Transfer")).toBeVisible();
    await expect(page.getByText("₦5,000.00")).toBeVisible();

    // Confirm transfer
    await page.click('[data-testid="confirm-transfer"]');

    // Verify success message
    await expect(
      page.getByText(/transfer successful|transfer completed/i),
    ).toBeVisible();
  });

  test("session timeout functionality", async ({ page }) => {
    // Login
    await page.fill('[data-testid="email"]', "test@interswitch.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");

    // Wait for session timeout warning (adjust timeout as needed for testing)
    // This would typically be mocked in a real test environment
    await page.waitForTimeout(240000); // 4 minutes

    // Verify timeout warning modal appears
    await expect(page.getByText("Session Timeout Warning")).toBeVisible();

    // Test extend session
    await page.click('[data-testid="extend-session"]');
    await expect(page.getByText("Session Timeout Warning")).toBeHidden();

    // Verify still on dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("accessibility features", async ({ page }) => {
    // Login
    await page.fill('[data-testid="email"]', "test@interswitch.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Test screen reader labels
    const accountCard = page.getByRole("button").first();
    await expect(accountCard).toHaveAttribute("aria-label");

    // Test focus management
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
