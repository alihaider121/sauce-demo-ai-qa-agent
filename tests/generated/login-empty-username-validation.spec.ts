import { test, expect } from '@playwright/test';

test('Display error when logging in with an empty username', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('error')).toHaveText('Epic sadface: Username is required');
});