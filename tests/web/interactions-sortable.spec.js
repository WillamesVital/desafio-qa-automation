import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage.js';
import { SortablePage } from '../../pages/Interactions/SortablePage.js';

test.describe('Interactions > Sortable (List)', () => {
  test('Ordenar itens da lista em ordem crescente', async ({ page }) => {
    const home = new HomePage(page);
    const sortable = new SortablePage(page);

    await test.step('Given que estou na página Sortable (aba List)', async () => {
      await home.goto();
      await home.openInteractions();
      await sortable.goto();
      await sortable.ensureListTab();
    });

    await test.step('When eu reordeno os itens para ordem crescente', async () => {
      // embaralhar primeiro (se já estiver ordem correta, ainda validamos estabilidade)
        await sortable.shuffleList();
      await sortable.sortListAscending();
    });

    await test.step('Then a ordem deve ser One..Six', async () => {
      const labels = await sortable.getListTexts();
      expect(labels.map(t => t.trim())).toEqual(['One', 'Two', 'Three', 'Four', 'Five', 'Six']);
    });
  });
});
