import { test, expect } from '@playwright/test';

test('Remove product directly from inventory page for problem user', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: For problem_user, clicking the Remove button on the inventory page fails to remove the item from the cart and update the badge, which is a deliberate site defect.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory.html/);

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');

  await page.getByTestId('remove-sauce-labs-backpack').click();

  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  await expect(page.getByTestId('add-to-cart-sauce-labs-backpack')).toBeVisible();
});