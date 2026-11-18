import { test, expect } from '@playwright/test';

test('Checkout validation error when Zip/Postal Code is missing', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('checkout').click();

  await page.getByTestId('firstName').fill('John');
  await page.getByTestId('lastName').fill('Doe');
  await page.getByTestId('continue').click();

  await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
});