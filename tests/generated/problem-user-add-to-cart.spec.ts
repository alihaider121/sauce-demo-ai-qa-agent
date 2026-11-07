import { test, expect } from '@playwright/test';

test('Verify adding item to cart works correctly for problem_user', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

  await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
  await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');
  await expect(page.getByTestId('add-to-cart-sauce-labs-backpack')).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});