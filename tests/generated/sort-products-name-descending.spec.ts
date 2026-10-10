import { test, expect } from '@playwright/test';

test('Sort products by name from Z to A', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL('/inventory.html');
  await expect(page.getByTestId('title')).toHaveText('Products');

  await page.getByTestId('product-sort-container').selectOption('za');

  await expect(page.getByTestId('active-option')).toHaveText('Name (Z to A)');

  const inventoryNames = page.getByTestId('inventory-item-name');
  await expect(inventoryNames.first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  await expect(inventoryNames.last()).toHaveText('Sauce Labs Backpack');
});