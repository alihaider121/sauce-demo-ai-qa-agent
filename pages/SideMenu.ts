import { expect, type Page, type Locator } from '@playwright/test';

/**
 * The burger menu available on every page after login.
 * Its data-test="open-menu" is only the icon image: an invisible button sits on top of it and
 * intercepts clicks, so we click the button by role. The menu's links stay "visible" while it is
 * parked off-screen, so we wait for the menu itself to report aria-hidden="false".
 */
export class SideMenu {
  readonly openButton: Locator;
  readonly menu: Locator;
  readonly allItemsLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.menu = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
  }

  async open() {
    await this.openButton.click();
    await expect(this.menu).toHaveAttribute('aria-hidden', 'false');
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.open();
    await this.resetLink.click();
  }
}
