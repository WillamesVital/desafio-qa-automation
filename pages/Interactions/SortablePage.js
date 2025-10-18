import { robustGoto, setupAdBlock } from '../../helpers/webUtils.js';

export class SortablePage {
  constructor(page) {
    this.page = page;
    this.listTab = page.locator('#demo-tab-list');
    this.gridTab = page.locator('#demo-tab-grid');
    this.listItems = page.locator('#demo-tabpane-list .vertical-list-container .list-group-item');
  }

  async goto() {
    await setupAdBlock(this.page);
    await robustGoto(this.page, 'https://demoqa.com/sortable');
    await this.listTab.waitFor({ state: 'visible' });

    await this.listItems.first().waitFor({ state: 'visible' });
  }

  async ensureListTab() {
    if (!(await this.listTab.getAttribute('class'))?.includes('active')) {
      await this.listTab.click();
    }
    await this.page.locator('#demo-tabpane-list').waitFor({ state: 'visible' });
  }

  async getListTexts() {
    return await this.listItems.allInnerTexts();
  }

  async moveLabelToIndex(label, index) {
    const item = this.page.locator('#demo-tabpane-list .vertical-list-container .list-group-item', { hasText: label }).first();
    const targetPos = this.page.locator('#demo-tabpane-list .vertical-list-container .list-group-item').nth(index);
    try {
      await item.dragTo(targetPos, { force: true });
    } catch {
      // fallback: ações de mouse com boundingBox
      const boxFrom = await item.boundingBox();
      const boxTo = await targetPos.boundingBox();
      if (boxFrom && boxTo) {
        await this.page.mouse.move(boxFrom.x + boxFrom.width / 2, boxFrom.y + boxFrom.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(boxTo.x + boxTo.width / 2, boxTo.y + boxTo.height / 2, { steps: 12 });
        await this.page.mouse.up();
      }
    }
    await this.page.waitForTimeout(150);
  }

  async shuffleList() {
    await this.ensureListTab();
    await this.moveLabelToIndex('Six', 0);
    await this.moveLabelToIndex('Four', 2);
    await this.moveLabelToIndex('Two', 4);
  }

  async sortListAscending() {
    await this.ensureListTab();
    const targetOrder = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
    for (let i = 0; i < targetOrder.length; i++) {
      const label = targetOrder[i];
      const item = this.page.locator('#demo-tabpane-list .vertical-list-container .list-group-item', { hasText: label }).first();
      const targetPos = this.page.locator('#demo-tabpane-list .vertical-list-container .list-group-item').nth(i);

      const currentTexts = (await this.getListTexts()).map(t => t.trim());
      if (currentTexts[i] === label) continue;

      try {
        await item.dragTo(targetPos, { force: true });
      } catch {
        const boxFrom = await item.boundingBox();
        const boxTo = await targetPos.boundingBox();
        if (boxFrom && boxTo) {
          await this.page.mouse.move(boxFrom.x + boxFrom.width / 2, boxFrom.y + boxFrom.height / 2);
          await this.page.mouse.down();
          await this.page.mouse.move(boxTo.x + boxTo.width / 2, boxTo.y + boxTo.height / 2, { steps: 12 });
          await this.page.mouse.up();
        }
      }
      await this.page.waitForTimeout(150);
    }
  }
}
