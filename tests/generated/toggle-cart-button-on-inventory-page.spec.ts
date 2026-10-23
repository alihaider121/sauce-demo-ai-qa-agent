import { test, expect } from '@playwright/test';

test('Add and remove item directly from inventory list toggling button state', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');

  const addToCartButton = page.getByTestId('add-to-cart-sauce-labs-backpack');
  const removeButton = page.getByTestId('remove-sauce-labs-backpack');
  const cartBadge = page.getByTestId('shopping-cart-badge');

  await expect(addToCartButton).toBeVisible();
  await expect(cartBadge).toHaveCount(0);

  await addToCartButton.click();

  await expect(cartBadge).toBeVisible();
  await expect(cartBadge).toHaveText('1');
  await expect(removeButton).toBeVisible();
  await expect(addToCartButton).toHaveCount(0);

  await removeButton.click();

  await expect(addToCartButton).toBeVisible();
  await expect(removeButton).toHaveCount(0);
  await expect(cartBadge).toHaveCount(0);
});