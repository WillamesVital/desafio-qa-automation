import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage.js';
import { BrowserWindowsPage } from '../../pages/Windows/BrowserWindowsPage.js';

// Cobertura: abrir Browser Windows, criar nova janela, validar texto e fechar

test('Windows > Browser Windows - abrir nova janela e validar mensagem', async ({ page }) => {
  const home = new HomePage(page);
  const windows = new BrowserWindowsPage(page);
  let newPage;

  await test.step('Given que acesso a página inicial do DemoQA', async () => {
    await home.goto();
  });

  await test.step('When eu abro a seção "Alerts, Frame & Windows"', async () => {
    await home.openAlertsFrameWindows();
  });

  await test.step('And navego para "Browser Windows"', async () => {
    await windows.goto();
  });

  await test.step('And clico no botão "New Window"', async () => {
    newPage = await windows.openNewWindow();
  });

  await test.step('Then uma nova janela deve ser aberta com a mensagem "This is a sample page"', async () => {
    await expect(newPage.locator('body')).toContainText('This is a sample page');
  });

  await test.step('And eu fecho a nova janela', async () => {
    await newPage.close();
  });
});
