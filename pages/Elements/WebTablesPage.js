import { robustGoto } from '../../helpers/webUtils.js';

export class WebTablesPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.locator('#addNewRecordButton');
    this.searchBox = page.locator('#searchBox');
    this.rows = page.locator('div.rt-tr-group');
    this.modal = page.locator('div.modal-content');
  }

  async goto() {
    await robustGoto(this.page, 'https://demoqa.com/webtables');
    await this.page.waitForSelector('#addNewRecordButton', { state: 'visible' });
  }

  async openAddModal() {
    await this.addButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async search(value) {
    await this.searchBox.fill(value);
    await this.page.waitForTimeout(150);
  }

  async clearSearch() {
    await this.searchBox.fill('');
    await this.page.waitForTimeout(150);
  }

  async fillAndSubmitForm(record) {
    const page = this.page;
    await page.fill('#firstName', record.firstName);
    await page.fill('#lastName', record.lastName);
    await page.fill('#userEmail', record.email);
    await page.fill('#age', String(record.age));
    await page.fill('#salary', String(record.salary));
    await page.fill('#department', record.department);
    await page.click('#submit');
    await this.modal.waitFor({ state: 'hidden' });
  }

  async editRowByEmail(email, patch) {
    const page = this.page;
    const row = page.locator('.rt-tbody .rt-tr-group').filter({ hasText: email });
    await row.locator('[title="Edit"]').click();
    await this.modal.waitFor({ state: 'visible' });
    for (const [field, value] of Object.entries(patch)) {
      const selector =
        field === 'firstName' ? '#firstName' :
        field === 'lastName' ? '#lastName' :
        field === 'email' || field === 'userEmail' ? '#userEmail' :
        field === 'age' ? '#age' :
        field === 'salary' ? '#salary' :
        field === 'department' ? '#department' : null;
      if (selector) {
        await page.fill(selector, String(value));
      }
    }
    await page.click('#submit');
    await this.modal.waitFor({ state: 'hidden' });
  }

  async deleteRowByEmail(email) {
    const row = this.page.locator('.rt-tbody .rt-tr-group').filter({ hasText: email });
    await row.locator('[title="Delete"]').click();
  }

  async rowExistsByEmail(email) {
    const row = this.page.locator('.rt-tbody .rt-tr-group').filter({ hasText: email });
    return await row.first().isVisible();
  }

  async countRows() {
    return await this.page.locator('.rt-tbody .rt-tr-group').count();
  }
}
