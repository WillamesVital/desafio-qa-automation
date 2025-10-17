/**
 * Test data helpers and generators
 */

/**
 * Generate a unique username for test purposes
 */
export function generateUsername(): string {
  return `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a unique email for test purposes
 */
export function generateEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test_${timestamp}_${random}@example.com`;
}

/**
 * Generate a random phone number (10 digits)
 */
export function generatePhoneNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Sample form data for testing
 */
export const sampleFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  gender: 'Male',
  mobile: '1234567890',
  subject: 'Maths',
  hobby: 'Sports',
  address: '123 Main Street, City, Country',
};

/**
 * Sample API test data
 */
export const sampleApiUser = {
  userName: 'testuser',
  password: 'Test@123456',
};

/**
 * Wait helper for specific time in milliseconds
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
