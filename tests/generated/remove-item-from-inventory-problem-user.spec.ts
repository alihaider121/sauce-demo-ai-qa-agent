import { test, expect } from '@playwright/test';

test('Remove item directly from inventory page as problem user', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: When logged in as problem_user, clicking the 'Remove' button on the inventory page fails to remove the item from the cart or update the shopping cart badge due to a deliberate defect.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');

  const addToCartButton = page.getByTestId('add-to-cart-sauce-labs-backpack');
  await addToCartButton.click();

  const cartBadge = page.getByTestId('shopping-cart-badge');
  await expect(cartBadge).toHaveText('1');

  const removeButton = page.getByTestId('remove-sauce-labs-backpack');
  await expect(removeButton).toBeVisible();
  await expect(removeButton).toHaveText('Remove');

  await removeButton.click();

  await expect(cartBadge).toHaveCount(0);
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toHaveText('Add to cart');
  await expect(removeButton).toHaveCount(0);
});