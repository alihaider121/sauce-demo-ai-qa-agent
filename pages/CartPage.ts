import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly removeButtons: Locator;

  constructor(private readonly page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.removeButtons = page.locator('[data-test^="remove-"]');
  }

  async openCheckout() {
    await this.checkoutButton.click();
  }

  async removeItem(productSlug: string) {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }
}
