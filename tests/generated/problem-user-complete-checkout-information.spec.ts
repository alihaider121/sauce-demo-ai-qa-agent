import { test, expect } from '@playwright/test';

test('Problem user can successfully enter checkout information and proceed', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: The site fails to navigate to the checkout overview page because problem_user has a deliberate defect on the checkout information form where entering the last name field is broken.");
  await page.goto('/');

  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory.html/);

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/.*cart.html/);

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL(/.*checkout-step-one.html/);

  await page.getByTestId('firstName').fill('Jane');
  await page.getByTestId('lastName').fill('Smith');
  await page.getByTestId('postalCode').fill('90210');
  await page.getByTestId('continue').click();

  await expect(page).toHaveURL(/.*checkout-step-two.html/);
  await expect(page.getByTestId('title')).toHaveText('Checkout: Overview');
});