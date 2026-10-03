import { test, expect } from '@playwright/test';

test('Verify checkout information form accepts last name for problem user', async ({ page }) => {
  test.fail(true, "Known app bug found by AI agent: When logged in as problem_user, the last name input field fails to accept or retain typed input due to a deliberate application defect on the checkout page.");
  await page.goto('/');
  await page.getByTestId('username').fill('problem_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/inventory\.html/);

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/cart\.html/);

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);

  await page.getByTestId('firstName').fill('Alice');
  await page.getByTestId('lastName').fill('Smith');
  await expect(page.getByTestId('lastName')).toHaveValue('Smith');
  await page.getByTestId('postalCode').fill('12345');

  await page.getByTestId('continue').click();
  await expect(page).toHaveURL(/checkout-step-two\.html/);
});