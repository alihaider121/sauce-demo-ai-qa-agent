import { test, expect } from '@playwright/test';

test('Verify product images accurately match item titles for problem user', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: The application displays the broken fallback image 'sl-404' instead of the correct product image when logged in as problem_user.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL('/inventory.html');

  const backpackImg = page.getByTestId('inventory-item-sauce-labs-backpack-img');
  await expect(backpackImg).toBeVisible();
  await expect(backpackImg).toHaveAttribute('src', /sauce-backpack/);
  await expect(backpackImg).not.toHaveAttribute('src', /sl-404/);
});