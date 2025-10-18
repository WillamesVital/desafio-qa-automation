export class HomePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://demoqa.com/');
  }

  async openForms() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Forms")').click();
  }

  async openAlertsFrameWindows() {
    await this.page.locator('div.card.mt-4.top-card:has-text("Alerts, Frame & Windows")').click();
  }
}
