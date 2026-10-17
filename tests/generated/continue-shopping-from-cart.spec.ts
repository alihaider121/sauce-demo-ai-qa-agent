import { test, expect } from '@playwright/test';

test('Continue shopping from cart preserves cart items', async ({ page }) => {
  await test.step('Log in as standard_user and verify inventory page', async () => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  await test.step('Add Sauce Labs Bike Light to cart', async () => {
    await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  await test.step('Navigate to cart and verify Bike Light is present', async () => {
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(page.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Bike Light']);
  });

  await test.step('Click Continue Shopping and verify return to inventory', async () => {
    await page.getByTestId('continue-shopping').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  await test.step('Add Sauce Labs Onesie to cart', async () => {
    await page.getByTestId('add-to-cart-sauce-labs-onesie').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  });

  await test.step('Navigate to cart and verify both items are present', async () => {
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
    await expect(page.getByTestId('inventory-item')).toHaveCount(2);
    await expect(page.getByTestId('inventory-item-name')).toHaveText([
      'Sauce Labs Bike Light',
      'Sauce Labs Onesie',
    ]);
  });
});