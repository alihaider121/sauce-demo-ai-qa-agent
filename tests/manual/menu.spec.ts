import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { SideMenu } from '../../pages/SideMenu';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');
});

test('user can log out from the side menu', async ({ page }) => {
  await new SideMenu(page).logout();

  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(new LoginPage(page).loginButton).toBeVisible();
});

test('reset app state empties the cart', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.addToCart('sauce-labs-backpack');
  await expect(inventory.cartBadge).toHaveText('1');

  await new SideMenu(page).resetAppState();

  await expect(inventory.cartBadge).toHaveCount(0);
});
