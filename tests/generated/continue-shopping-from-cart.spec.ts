import { test, expect } from '@playwright/test';

test('Continue shopping returns user from cart to inventory page', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);

  await page.getByTestId('shopping-cart-link').click();

  await expect(page).toHaveURL(/.*cart\.html/);
  await expect(page.getByTestId('title')).toHaveText('Your Cart');

  await page.getByTestId('continue-shopping').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');
  await expect(page.getByTestId('inventory-list')).toBeVisible();
});