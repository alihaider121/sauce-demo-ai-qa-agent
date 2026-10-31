import { test, expect } from '@playwright/test';

test('Login fails with error when username is empty', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('error')).toHaveText('Epic sadface: Username is required');
  await expect(page.getByTestId('login-button')).toBeVisible();
  await expect(page).toHaveURL(/.*saucedemo\.com\/?$/);
});