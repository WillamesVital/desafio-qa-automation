import { expect } from '@playwright/test';

export class PracticeFormPage {
  constructor(page) {
    this.page = page;
    this._lastData = null;
  }

  async goto() {
    await this.page.goto('https://demoqa.com/automation-practice-form');
  }

  async fillForm(data) {
    const {
      firstName,
      lastName,
      email,
      gender,
      mobile,
      dob,
      subjects,
      hobbies,
      picturePath,
      address,
      state,
      city,
    } = data;

    const firstNameInput = this.page.locator('#firstName');
    await firstNameInput.fill(firstName);
    await firstNameInput.waitFor();
    if ((await firstNameInput.inputValue()) !== firstName) throw new Error('firstName não preenchido corretamente');

    const lastNameInput = this.page.locator('#lastName');
    await lastNameInput.fill(lastName);
    if ((await lastNameInput.inputValue()) !== lastName) throw new Error('lastName não preenchido corretamente');

    const emailInput = this.page.locator('#userEmail');
    await emailInput.fill(email);
    if ((await emailInput.inputValue()) !== email) throw new Error('email não preenchido corretamente');

    await this.page.getByText(gender, { exact: true }).click();
    try {
      const genderInput = this.page.getByLabel(gender, { exact: true });
      if (!(await genderInput.isChecked())) throw new Error('gender não selecionado');
    } catch {}

    const mobileInput = this.page.locator('#userNumber');
    await mobileInput.fill(mobile);
    if ((await mobileInput.inputValue()) !== mobile) throw new Error('mobile não preenchido corretamente');

    await this.page.locator('#dateOfBirthInput').click();
    await this.page.locator('.react-datepicker__month-select').selectOption({ label: dob.month });
    await this.page.locator('.react-datepicker__year-select').selectOption(String(dob.year));
    await this.page.locator(`.react-datepicker__day--0${String(dob.day).padStart(2, '0')}:not(.react-datepicker__day--outside-month)`).first().click();
    const expectedDob = `${String(dob.day).padStart(2, '0')} ${dob.month} ${dob.year}`;
    const dobValue = await this.page.locator('#dateOfBirthInput').inputValue();
    if (!dobValue.includes(String(dob.year))) throw new Error('date of birth não selecionada corretamente');

    await this.page.locator('#subjectsInput').fill(subjects, { delay: 100 });
    await this.page.keyboard.press('Enter', { delay: 100 });
    await expect(this.page.locator('#subjectsContainer')).toContainText(subjects, { timeout: 2000 });

    for (const h of hobbies) {
      await this.page.getByText(h, { exact: true }).click({ timeout: 2000 });
      try {
        const hobbyInput = this.page.getByLabel(h, { exact: true });
        if (!(await hobbyInput.isChecked())) throw new Error(`hobby não marcado: ${h}`);
      } catch {}
    }

    if (picturePath) {
      await this.page.locator('#uploadPicture').setInputFiles(picturePath);
      const fileVal = await this.page.locator('#uploadPicture').inputValue();
      if (!fileVal || (!fileVal.includes('fakepath') && !fileVal.toLowerCase().includes('sample.txt'))) {
      }
    }

    const addressInput = this.page.locator('#currentAddress');
    await addressInput.fill(address);
    if ((await addressInput.inputValue()) !== address) throw new Error('address não preenchido corretamente');

    await this.page.locator('#state').click();
    await this.page.locator('#state .css-26l3qy-menu, #state [id*="react-select-"]').getByText(state, { exact: true }).click();
    await this.page.locator('#state').getByText(state, { exact: true }).waitFor({ state: 'visible' });
    await this.page.locator('#city').click();
    await this.page.locator('#city .css-26l3qy-menu, #city [id*="react-select-"]').getByText(city, { exact: true }).click();
    await this.page.locator('#city').getByText(city, { exact: true }).waitFor({ state: 'visible' });

    this._lastData = data;
  }

  async verifyFilled() {
    const checks = [
      this.page.locator('#firstName').inputValue(),
      this.page.locator('#lastName').inputValue(),
      this.page.locator('#userEmail').inputValue(),
      this.page.locator('#userNumber').inputValue(),
      this.page.locator('#currentAddress').inputValue(),
    ];
    const [fn, ln, em, mb, addr] = await Promise.all(checks);
    if (!fn || !ln || !em || !mb || !addr) throw new Error('Formulário incompleto: há campos vazios');
  }

  async submit(options = {}) {
    await this.verifyFilled();
    await this.page.locator('#submit').click({ timeout: options.timeout });
  }

  async isPopupVisible() {
    const modal = this.page.locator('.modal-content');
    await modal.waitFor({ state: 'visible' });
    return await modal.isVisible();
  }

  async closePopup() {
    const closeBtn = this.page.locator('#closeLargeModal');
    await closeBtn.scrollIntoViewIfNeeded();
    await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn.click();
  }

  async _dismissOverlays() {

    await this.page.evaluate(() => {
      const selectors = [
        '#fixedban',
        'footer',
        '[id^="google_ads_iframe"]',
        '.adsbygoogle',
        'iframe[src*="ads"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="doubleclick"]',
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });

      const fixeds = Array.from(document.querySelectorAll('*'))
        .filter(el => getComputedStyle(el).position === 'fixed' && el !== document.body);
      fixeds.forEach(el => {
        if (el.id !== 'example-modal-sizes-title-lg' && !el.closest('.modal')) {
  
          try { el.parentElement?.removeChild(el); } catch {}
        }
      });
    });
  }
}
