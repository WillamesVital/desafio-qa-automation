import { test, expect } from '@playwright/test';

/**
 * Web tests for DemoQA Practice Form
 * URL: https://demoqa.com/automation-practice-form
 */

test.describe('Practice Form - DemoQA', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the practice form page
    await page.goto('/automation-practice-form');
    // Wait for the form to be visible
    await page.waitForSelector('#userForm', { state: 'visible' });
  });

  test('should load the practice form page', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/DEMOQA/);
    
    // Verify main heading
    const heading = page.locator('h1.text-center');
    await expect(heading).toHaveText('Practice Form');
  });

  test('should have all required form fields visible', async ({ page }) => {
    // Check for required fields
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#userEmail')).toBeVisible();
    await expect(page.locator('#userNumber')).toBeVisible();
    await expect(page.locator('#subjectsInput')).toBeVisible();
    await expect(page.locator('#currentAddress')).toBeVisible();
  });

  test('should fill and submit the practice form successfully', async ({ page }) => {
    // Fill First Name
    await page.locator('#firstName').fill('John');
    
    // Fill Last Name
    await page.locator('#lastName').fill('Doe');
    
    // Fill Email
    await page.locator('#userEmail').fill('john.doe@example.com');
    
    // Select Gender
    await page.locator('label[for="gender-radio-1"]').click();
    
    // Fill Mobile Number
    await page.locator('#userNumber').fill('1234567890');
    
    // Fill Date of Birth
    await page.locator('#dateOfBirthInput').click();
    await page.locator('.react-datepicker__month-select').selectOption('5'); // June
    await page.locator('.react-datepicker__year-select').selectOption('1990');
    await page.locator('.react-datepicker__day--015').click();
    
    // Fill Subjects (type and select)
    await page.locator('#subjectsInput').fill('Maths');
    await page.keyboard.press('Enter');
    
    // Select Hobbies
    await page.locator('label[for="hobbies-checkbox-1"]').click();
    
    // Fill Current Address
    await page.locator('#currentAddress').fill('123 Main Street, City, Country');
    
    // Select State
    await page.locator('#state').click();
    await page.locator('div[id^="react-select-3-option"]').first().click();
    
    // Select City
    await page.locator('#city').click();
    await page.locator('div[id^="react-select-4-option"]').first().click();
    
    // Submit the form
    await page.locator('#submit').click();
    
    // Verify submission modal appears
    await expect(page.locator('#example-modal-sizes-title-lg')).toBeVisible();
    await expect(page.locator('#example-modal-sizes-title-lg')).toHaveText('Thanks for submitting the form');
    
    // Verify submitted data in the modal
    const modalContent = page.locator('.modal-body');
    await expect(modalContent).toContainText('John Doe');
    await expect(modalContent).toContainText('john.doe@example.com');
  });

  test('should validate email format', async ({ page }) => {
    // Fill First Name
    await page.locator('#firstName').fill('John');
    
    // Fill Last Name
    await page.locator('#lastName').fill('Doe');
    
    // Fill invalid Email
    await page.locator('#userEmail').fill('invalid-email');
    
    // Select Gender
    await page.locator('label[for="gender-radio-1"]').click();
    
    // Fill Mobile Number
    await page.locator('#userNumber').fill('1234567890');
    
    // Try to submit
    await page.locator('#submit').click();
    
    // Check if email field has error state
    const emailInput = page.locator('#userEmail');
    await expect(emailInput).toHaveClass(/error/);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.locator('#submit').click();
    
    // Verify that the modal does not appear (form not submitted)
    await expect(page.locator('#example-modal-sizes-title-lg')).not.toBeVisible();
    
    // Verify required fields have error styling
    const firstNameInput = page.locator('#firstName');
    await expect(firstNameInput).toHaveClass(/error/);
  });

  test('should allow file upload', async ({ page }) => {
    // Create a test file for upload
    const fileContent = 'Test file content';
    const buffer = Buffer.from(fileContent);
    
    // Upload file
    const fileInput = page.locator('#uploadPicture');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });
    
    // Verify file is selected (the label should show the filename)
    const uploadLabel = page.locator('#uploadPicture');
    await expect(uploadLabel).toHaveValue(/test\.txt/);
  });
});
