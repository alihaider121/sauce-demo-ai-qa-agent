import { test, expect } from '@playwright/test';

test('View product details, add to cart, and return to inventory', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);

  await page.getByTestId('item-4-title-link').click();

  await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

  await page.getByTestId('back-to-products').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');
});