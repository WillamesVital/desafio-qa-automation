import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../../pages/HomePage.js';
import { PracticeFormPage } from '../../pages/Forms/PracticeFormPage.js';
import { genFirstName, genLastName, genEmail, genMobile, genAddress } from '../../helpers/dataFactory.js';

test('Forms > Practice Form - preencher e submeter com popup', async ({ page, browserName }) => {
  const home = new HomePage(page);
  const form = new PracticeFormPage(page);

  // 1) Acessar o site e abrir Forms
  await home.goto();
  await home.openForms();

  // 2) Navegar direto ao Practice Form (sub-menu)
  await form.goto();

  // 3) Preencher dados com valores aleatórios
  const data = {
    firstName: genFirstName(),
    lastName: genLastName(),
    email: genEmail(),
    gender: ['Male', 'Female', 'Other'][Math.floor(Math.random()*3)],
    mobile: genMobile(),
    dob: { day: 15, month: 'May', year: 1995 },
    subjects: 'English',
    hobbies: ['Sports', 'Reading'],
    picturePath: path.resolve('tests/assets/upload/sample.txt'),
    address: genAddress(),
    state: 'NCR',
    city: 'Delhi',
  };

  await form.fillForm(data);

  const originalViewport = page.viewportSize();
  if (browserName === 'chromium') {
    const w = originalViewport?.width ?? 1280;
    const h = originalViewport?.height ?? 720;
    await page.setViewportSize({ width: w, height: h + 300 });
  } else {
    await page.evaluate(() => { document.body.style.zoom = '70%'; });
  }

  await form.submit({ timeout: 5000 });

  await expect(await form.isPopupVisible()).toBeTruthy();

  await expect(page.locator('#example-modal-sizes-title-lg')).toContainText('Thanks for submitting the form');

  await form.closePopup();
});
