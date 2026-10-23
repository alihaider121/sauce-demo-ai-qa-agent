import { test, expect } from '@playwright/test';

test('Verify problem user can complete checkout information form', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: The site has deliberate defects for problem_user during the cart and checkout flow that cause unexpected items in the cart and prevent completing the checkout form.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/.*cart\.html/);
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  await expect(page.getByTestId('title')).toHaveText('Checkout: Your Information');

  await page.getByTestId('firstName').fill('Alex');
  await expect(page.getByTestId('firstName')).toHaveValue('Alex');

  await page.getByTestId('lastName').fill('Smith');
  await expect(page.getByTestId('lastName')).toHaveValue('Smith');

  await page.getByTestId('postalCode').fill('90210');
  await expect(page.getByTestId('postalCode')).toHaveValue('90210');

  await page.getByTestId('continue').click();

  await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  await expect(page.getByTestId('title')).toHaveText('Checkout: Overview');
});