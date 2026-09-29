import { test, expect } from '@playwright/test';

test('Remove item directly from the cart page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();

  await expect(page.getByTestId('inventory-item')).toBeVisible();
  await page.getByTestId('remove-sauce-labs-backpack').click();

  await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});