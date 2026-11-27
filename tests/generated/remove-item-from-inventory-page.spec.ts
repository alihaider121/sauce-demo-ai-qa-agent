import { test, expect } from '@playwright/test';

test('Add and remove item directly from the inventory page', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);

  const backpackAddButton = page.getByTestId('add-to-cart-sauce-labs-backpack');
  const backpackRemoveButton = page.getByTestId('remove-sauce-labs-backpack');
  const cartBadge = page.getByTestId('shopping-cart-badge');

  await expect(backpackAddButton).toBeVisible();
  await expect(backpackAddButton).toHaveText('Add to cart');

  await backpackAddButton.click();

  await expect(cartBadge).toHaveText('1');
  await expect(backpackRemoveButton).toBeVisible();
  await expect(backpackRemoveButton).toHaveText('Remove');

  await backpackRemoveButton.click();

  await expect(cartBadge).toHaveCount(0);
  await expect(backpackAddButton).toBeVisible();
  await expect(backpackAddButton).toHaveText('Add to cart');
});