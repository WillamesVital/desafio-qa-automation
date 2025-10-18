import { setupAdBlock, robustGoto } from '../helpers/webUtils.js';
export class HomePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await setupAdBlock(this.page);
    await robustGoto(this.page, 'https://demoqa.com/');
  }

  async openForms() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Forms")').click();
  }

  async openAlertsFrameWindows() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Alerts, Frame & Windows")').click();
  }

  async openElements() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Elements")').click();
  }

  async openWidgets() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Widgets")').click();
  }
}
