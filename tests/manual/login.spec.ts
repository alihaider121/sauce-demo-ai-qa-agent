import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('Login', () => {
  test('standard user can log in', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(new InventoryPage(page).title).toHaveText('Products');
  });

  test('locked out user sees an error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('locked_out_user');

    await expect(login.error).toContainText('Sorry, this user has been locked out');
  });

  test('wrong password is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'wrong_password');

    await expect(login.error).toContainText('Username and password do not match');
  });
});
