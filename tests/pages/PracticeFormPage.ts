import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for DemoQA Practice Form
 * This class encapsulates all interactions with the practice form page
 */
export class PracticeFormPage {
  readonly page: Page;
  
  // Form field locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly subjectsInput: Locator;
  readonly currentAddressInput: Locator;
  readonly submitButton: Locator;
  
  // Other elements
  readonly pageHeading: Locator;
  readonly submissionModal: Locator;
  readonly modalTitle: Locator;
  readonly modalBody: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.mobileInput = page.locator('#userNumber');
    this.dateOfBirthInput = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('#subjectsInput');
    this.currentAddressInput = page.locator('#currentAddress');
    this.submitButton = page.locator('#submit');
    
    this.pageHeading = page.locator('h1.text-center');
    this.submissionModal = page.locator('.modal-content');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.modalBody = page.locator('.modal-body');
  }

  /**
   * Navigate to the practice form page
   */
  async goto() {
    await this.page.goto('/automation-practice-form');
    await this.page.waitForSelector('#userForm', { state: 'visible' });
  }

  /**
   * Fill the first name field
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill the last name field
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill the email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Select gender by clicking the label
   */
  async selectGender(gender: 'Male' | 'Female' | 'Other') {
    const genderMap = {
      'Male': 1,
      'Female': 2,
      'Other': 3,
    };
    await this.page.locator(`label[for="gender-radio-${genderMap[gender]}"]`).click();
  }

  /**
   * Fill the mobile number field
   */
  async fillMobile(mobile: string) {
    await this.mobileInput.fill(mobile);
  }

  /**
   * Set date of birth
   */
  async setDateOfBirth(month: string, year: string, day: string) {
    await this.dateOfBirthInput.click();
    await this.page.locator('.react-datepicker__month-select').selectOption(month);
    await this.page.locator('.react-datepicker__year-select').selectOption(year);
    await this.page.locator(`.react-datepicker__day--0${day}`).click();
  }

  /**
   * Add a subject to the subjects field
   */
  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Select a hobby by clicking the label
   */
  async selectHobby(hobby: 'Sports' | 'Reading' | 'Music') {
    const hobbyMap = {
      'Sports': 1,
      'Reading': 2,
      'Music': 3,
    };
    await this.page.locator(`label[for="hobbies-checkbox-${hobbyMap[hobby]}"]`).click();
  }

  /**
   * Upload a picture
   */
  async uploadPicture(filePath: string) {
    const fileInput = this.page.locator('#uploadPicture');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Fill the current address field
   */
  async fillCurrentAddress(address: string) {
    await this.currentAddressInput.fill(address);
  }

  /**
   * Select state from dropdown
   */
  async selectState(state: string) {
    await this.page.locator('#state').click();
    await this.page.locator(`div[id^="react-select-3-option"]`).filter({ hasText: state }).click();
  }

  /**
   * Select city from dropdown
   */
  async selectCity(city: string) {
    await this.page.locator('#city').click();
    await this.page.locator(`div[id^="react-select-4-option"]`).filter({ hasText: city }).click();
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Fill the entire form with provided data
   */
  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    mobile: string;
    dateOfBirth?: { month: string; year: string; day: string };
    subjects?: string[];
    hobbies?: Array<'Sports' | 'Reading' | 'Music'>;
    address: string;
    state?: string;
    city?: string;
  }) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillEmail(data.email);
    await this.selectGender(data.gender);
    await this.fillMobile(data.mobile);
    
    if (data.dateOfBirth) {
      await this.setDateOfBirth(
        data.dateOfBirth.month,
        data.dateOfBirth.year,
        data.dateOfBirth.day
      );
    }
    
    if (data.subjects) {
      for (const subject of data.subjects) {
        await this.addSubject(subject);
      }
    }
    
    if (data.hobbies) {
      for (const hobby of data.hobbies) {
        await this.selectHobby(hobby);
      }
    }
    
    await this.fillCurrentAddress(data.address);
    
    if (data.state) {
      await this.selectState(data.state);
    }
    
    if (data.city) {
      await this.selectCity(data.city);
    }
  }

  /**
   * Check if submission was successful
   */
  async isSubmissionSuccessful(): Promise<boolean> {
    try {
      await this.modalTitle.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the submission modal content
   */
  async getModalContent(): Promise<string> {
    return await this.modalBody.textContent() || '';
  }
}
