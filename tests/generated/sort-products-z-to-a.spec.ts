import { test, expect } from '@playwright/test';

test('Sort products by name Z to A', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL('/inventory.html');

  await page.getByTestId('product-sort-container').selectOption('za');

  const itemNames = page.getByTestId('inventory-item-name');

  await expect(itemNames.first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  await expect(itemNames).toHaveText([
    'Test.allTheThings() T-Shirt (Red)',
    'Sauce Labs Onesie',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Bike Light',
    'Sauce Labs Backpack'
  ]);
});