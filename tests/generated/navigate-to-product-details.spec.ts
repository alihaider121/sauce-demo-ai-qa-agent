import { test, expect } from '@playwright/test';

test('Navigate to product details page by clicking item title', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await page.getByTestId('item-4-title-link').click();

  await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  await expect(page.getByTestId('inventory-item-desc')).toContainText('carry.allTheThings()');
  await expect(page.getByTestId('inventory-item-price')).toHaveText('$29.99');
  await expect(page.getByTestId('back-to-products')).toBeVisible();
});