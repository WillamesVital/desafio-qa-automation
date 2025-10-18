import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage.js';
import { WebTablesPage } from '../../pages/Elements/WebTablesPage.js';

function randomEmail(suffix = '') {
  const n = Math.random().toString(36).slice(2, 8);
  return `qa.${n}${suffix}@example.com`;
}

function makeRecord(overrides = {}) {
  return {
    firstName: overrides.firstName ?? 'QA',
    lastName: overrides.lastName ?? 'User',
    email: overrides.email ?? randomEmail(),
    age: overrides.age ?? 28,
    salary: overrides.salary ?? 4500,
    department: overrides.department ?? 'QA',
  };
}

test.describe('Elements > Web Tables', () => {
  test('criar, editar e deletar um registro', async ({ page }) => {
    const home = new HomePage(page);
    const tables = new WebTablesPage(page);

    await test.step('Given que acesso a home e navego até Web Tables', async () => {
      await home.goto();
      await home.openElements();
      await tables.goto();
    });

    // Criar
    const record = makeRecord();
    await test.step('When crio um novo registro', async () => {
      await tables.openAddModal();
      await tables.fillAndSubmitForm(record);
    });

    await test.step('Then devo ver o registro criado na tabela', async () => {
      await tables.search(record.email);
      await expect(await tables.rowExistsByEmail(record.email)).toBeTruthy();
      await tables.clearSearch();
    });

    // Editar
    const patch = { lastName: 'Edited', salary: 9000 };
    await test.step('And edito o registro criado', async () => {
      await tables.editRowByEmail(record.email, patch);
    });

    await test.step('Then os dados editados devem ser refletidos', async () => {
      await tables.search(record.email);
      const row = page.locator('.rt-tbody .rt-tr-group').filter({ hasText: record.email });
      await expect(row).toContainText('Edited');
      await expect(row).toContainText('9000');
      await tables.clearSearch();
    });

    // Deletar
    await test.step('And deleto o registro criado', async () => {
      await tables.search(record.email);
      await tables.deleteRowByEmail(record.email);
      await tables.clearSearch();
    });

    await test.step('Then o registro não deve mais existir', async () => {
      // Pequeno wait para a remoção refletir no DOM
      await page.waitForTimeout(200);
      await tables.search(record.email);
      await expect(await tables.rowExistsByEmail(record.email)).toBeFalsy();
      await tables.clearSearch();
    });
  });

  test('bônus: criar 12 registros e depois deletá-los', async ({ page }) => {
    const home = new HomePage(page);
    const tables = new WebTablesPage(page);

    await test.step('Given que acesso Web Tables', async () => {
      await home.goto();
      await home.openElements();
      await tables.goto();
    });

    const createdEmails = [];
    await test.step('When crio 12 registros dinamicamente', async () => {
      for (let i = 0; i < 12; i++) {
        const rec = makeRecord({ email: randomEmail(`.${i}`) });
        await tables.openAddModal();
        await tables.fillAndSubmitForm(rec);
        createdEmails.push(rec.email);
      }
    });

    await test.step('Then devo ver pelo menos 12 registros a mais na tabela', async () => {
      for (const email of createdEmails) {
        await tables.search(email);
        expect(await tables.rowExistsByEmail(email)).toBeTruthy();
        await tables.clearSearch();
      }
    });

    await test.step('And deleto todos os 12 registros criados', async () => {
      for (const email of createdEmails) {
        await tables.search(email);
        await tables.deleteRowByEmail(email);
        await tables.clearSearch();
      }
    });

    await test.step('Then nenhum dos 12 registros deve permanecer', async () => {
      await page.waitForTimeout(300);
      for (const email of createdEmails) {
        await tables.search(email);
        expect(await tables.rowExistsByEmail(email)).toBeFalsy();
        await tables.clearSearch();
      }
    });
  });
});
