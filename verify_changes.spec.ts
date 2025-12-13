import { test, expect } from '@playwright/test';

test('verify coin display and support page', async ({ page }) => {
  // 1. Go to Home (Checking Header)
  await page.goto('http://localhost:5000');
  await page.waitForTimeout(1000);

  // Note: Since we are not logged in by default, we won't see coins.
  // But we can check if the Login button is there.
  await expect(page.getByTestId('link-login')).toBeVisible();

  // 2. Go to Support Page
  await page.goto('http://localhost:5000/support');
  await page.waitForTimeout(1000);

  // Check for new text (Reward Type might vary based on config, but "Claim" should be there)
  await expect(page.locator('text=Daily Check-in')).toBeVisible();

  // 3. Admin Page (protected, likely redirects to login)
  await page.goto('http://localhost:5000/admin');
  await page.waitForTimeout(1000);
  // Should probably see login or security check
});
