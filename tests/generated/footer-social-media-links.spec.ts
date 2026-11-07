import { test, expect } from '@playwright/test';

test('Verify social media links in footer have correct href attributes', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/.*inventory.html/);

  const xLink = page.getByTestId('social-x');
  const facebookLink = page.getByTestId('social-facebook');
  const linkedinLink = page.getByTestId('social-linkedin');

  await xLink.scrollIntoViewIfNeeded();

  await expect(xLink).toHaveAttribute('href', 'https://x.com/saucelabs');
  await expect(xLink).toHaveAttribute('target', '_blank');

  await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
  await expect(facebookLink).toHaveAttribute('target', '_blank');

  await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
  await expect(linkedinLink).toHaveAttribute('target', '_blank');
});