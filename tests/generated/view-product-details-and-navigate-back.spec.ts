import { test, expect } from '@playwright/test';

test('view product details and return to inventory via back button', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');

  await page.getByTestId('item-4-title-link').click();

  await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  await expect(page.getByTestId('inventory-item-price')).toHaveText('$29.99');
  await expect(page.getByTestId('inventory-item-desc')).toBeVisible();

  await page.getByTestId('back-to-products').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');
  await expect(page.getByTestId('inventory-list')).toBeVisible();
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});