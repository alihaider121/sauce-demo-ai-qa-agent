import { type Page, type Locator } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortSelect: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
  }

  /** e.g. addToCart('sauce-labs-backpack') */
  async addToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async openCart() {
    await this.cartLink.click();
    // Sauce Demo is a single-page app: the URL changes before the cart renders, so wait for the
    // cart list itself — otherwise the next step can still see the inventory page (flaky on CI)
    await this.page.getByTestId('cart-list').waitFor();
  }
}
