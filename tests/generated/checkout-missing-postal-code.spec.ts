import { test, expect } from '@playwright/test';

test('Validate error when postal code is missing during checkout', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/.*inventory.html/);

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/.*cart.html/);

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL(/.*checkout-step-one.html/);

  await page.getByTestId('firstName').fill('John');
  await page.getByTestId('lastName').fill('Doe');
  await page.getByTestId('continue').click();

  await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
});