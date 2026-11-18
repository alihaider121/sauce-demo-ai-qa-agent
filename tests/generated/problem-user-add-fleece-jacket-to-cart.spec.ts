import { test, expect } from '@playwright/test';

test('Problem user adds Sauce Labs Fleece Jacket to cart', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: When logged in as problem_user, clicking the 'Add to cart' button for Sauce Labs Fleece Jacket fails to add the item to the cart due to a deliberate site defect.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory.html/);

  await page.getByTestId('add-to-cart-sauce-labs-fleece-jacket').click();

  const cartBadge = page.getByTestId('shopping-cart-badge');
  await expect(cartBadge).toBeVisible();
  await expect(cartBadge).toHaveText('1');
});