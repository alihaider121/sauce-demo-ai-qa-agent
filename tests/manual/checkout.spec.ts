import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');
});

test('adding an item updates the cart badge', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.addToCart('sauce-labs-backpack');
  await expect(inventory.cartBadge).toHaveText('1');
});

test('user can complete a purchase end to end', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const checkout = new CheckoutPage(page);

  await inventory.addToCart('sauce-labs-backpack');
  await inventory.openCart();
  await checkout.checkoutButton.click();
  await checkout.fillInfo('Ali', 'Haider', '54000');
  await checkout.finishButton.click();

  await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
});

test('checkout requires a first name', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const checkout = new CheckoutPage(page);

  await inventory.addToCart('sauce-labs-bike-light');
  await inventory.openCart();
  await checkout.checkoutButton.click();
  await checkout.continueButton.click();

  await expect(checkout.error).toContainText('First Name is required');
});
