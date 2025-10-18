import { robustGoto } from '../../helpers/webUtils.js';
export class BrowserWindowsPage {
  constructor(page) {
    this.page = page;
    this.newWindowButton = this.page.locator('#windowButton');
  }

  async goto() {
    await robustGoto(this.page, 'https://demoqa.com/browser-windows');
  }

  async openNewWindow() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.newWindowButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }
}
