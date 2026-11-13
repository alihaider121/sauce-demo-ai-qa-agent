import { test, expect } from '@playwright/test';

test('Attempt login with empty credentials displays validation error', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('error')).toContainText('Epic sadface: Username is required');
  await expect(page).toHaveURL('/');
});