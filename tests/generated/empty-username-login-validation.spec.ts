import { test, expect } from '@playwright/test';

test('validate error message when logging in with empty username', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('error')).toHaveText('Epic sadface: Username is required');
  await expect(page).toHaveURL('/');
});