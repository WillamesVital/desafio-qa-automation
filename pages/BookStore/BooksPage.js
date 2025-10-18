export class BooksPage {
  constructor(page) {
    this.page = page;
    this.rows = this.page.locator('.rt-tr-group');
    this.searchBox = this.page.locator('#searchBox');
  }

  async goto() {
    await this.page.goto('https://demoqa.com/books');
  }

  async search(query) {
    await this.searchBox.fill(query);
  }

  async listDisplayedTitles() {
    const count = await this.rows.count();
    const titles = [];
    for (let i = 0; i < count; i++) {
      const row = this.rows.nth(i);
      const title = (await row.locator('a').first().textContent()) || '';
      titles.push(title.trim());
    }
    return titles;
  }
}
