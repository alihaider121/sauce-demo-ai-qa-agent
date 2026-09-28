import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Problem user flows', () => {
  test('problem user can log in and view the inventory list', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.goto();
    await login.login('problem_user');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventory.title).toHaveText('Products');
    await expect(inventory.itemNames.first()).toBeVisible();
  });

  test('cart shows selected items before checkout', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await login.goto();
    await login.login('problem_user');

    await inventory.addToCart('sauce-labs-bike-light');
    await expect(inventory.cartBadge).toHaveText('1'); // item is really in the cart before we open it
    await inventory.openCart();

    await expect(cart.itemNames).toContainText('Sauce Labs Bike Light');
    await expect(cart.checkoutButton).toBeVisible();
  });
});
