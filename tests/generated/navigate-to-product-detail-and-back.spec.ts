import { test, expect } from '@playwright/test';

test('navigate to product detail page and return to inventory list', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*\/inventory\.html/);
  await expect(page.getByTestId('inventory-list')).toBeVisible();

  await page.getByTestId('item-4-title-link').click();

  await expect(page).toHaveURL(/.*\/inventory-item\.html\?id=4/);
  await expect(page.getByTestId('back-to-products')).toBeVisible();
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

  await page.getByTestId('back-to-products').click();

  await expect(page).toHaveURL(/.*\/inventory\.html/);
  await expect(page.getByTestId('inventory-list')).toBeVisible();
});