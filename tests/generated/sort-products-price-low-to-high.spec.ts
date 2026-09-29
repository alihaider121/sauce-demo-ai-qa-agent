import { test, expect } from '@playwright/test';

test('Sort products by price low to high', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await page.getByTestId('product-sort-container').selectOption('lohi');

  const inventoryItems = page.locator('.inventory_item');
  
  const firstItemName = inventoryItems.first().getByTestId('inventory-item-name');
  const firstItemPrice = inventoryItems.first().locator('.inventory_item_price');
  
  const lastItemName = inventoryItems.last().getByTestId('inventory-item-name');
  const lastItemPrice = inventoryItems.last().locator('.inventory_item_price');

  await expect(firstItemName).toHaveText('Sauce Labs Onesie');
  await expect(firstItemPrice).toHaveText('$7.99');
  
  await expect(lastItemName).toHaveText('Sauce Labs Fleece Jacket');
  await expect(lastItemPrice).toHaveText('$49.99');
});