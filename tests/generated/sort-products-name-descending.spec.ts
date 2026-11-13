import { test, expect } from '@playwright/test';

test('Sort products alphabetically from Z to A', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL('/inventory.html');

  await page.getByTestId('product-sort-container').selectOption('za');

  const itemNames = page.getByTestId('inventory-item-name');

  await expect(itemNames.first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  await expect(itemNames.last()).toHaveText('Sauce Labs Backpack');

  const actualNames = await itemNames.allTextContents();
  const expectedSortedNames = [...actualNames].sort((a, b) => b.localeCompare(a));
  expect(actualNames).toEqual(expectedSortedNames);
});