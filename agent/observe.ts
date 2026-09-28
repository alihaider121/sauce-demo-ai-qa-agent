/**
 * OBSERVE: the agent's "eyes".
 * Opens each key page of Sauce Demo and captures a compact text description:
 * the accessibility snapshot (what a screen reader sees) plus every data-test id
 * (the stable hooks the tests should use as locators).
 */
import { chromium } from '@playwright/test';

export interface PageSnapshot {
  name: string;
  url: string;
  testIds: string[];
  aria: string;
}

const BASE = 'https://www.saucedemo.com';

export async function observeSite(): Promise<PageSnapshot[]> {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
  const page = await browser.newPage();
  const snapshots: PageSnapshot[] = [];

  async function capture(name: string) {
    const testIds = await page.$$eval('[data-test]', (els) =>
      [...new Set(els.map((e) => e.getAttribute('data-test') as string))],
    );
    const aria = await page.locator('body').ariaSnapshot();
    snapshots.push({ name, url: page.url(), testIds, aria: aria.slice(0, 3000) });
    console.log(`  👀 ${name}: ${testIds.length} elements`);
  }

  await page.goto(BASE);
  await capture('Login page');

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await capture('Inventory (product list)');

  await page.locator('[data-test="inventory-item-name"]').first().click();
  await capture('Product detail');

  await page.locator('[data-test^="add-to-cart"]').first().click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await capture('Cart');

  await page.locator('[data-test="checkout"]').click();
  await capture('Checkout: your information');

  await browser.close();
  return snapshots;
}

export function snapshotsToText(snaps: PageSnapshot[]): string {
  return snaps
    .map((s) => `### ${s.name} (${s.url})\ndata-test ids: ${s.testIds.join(', ')}\n\n${s.aria}`)
    .join('\n\n');
}
