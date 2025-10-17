import { test, expect } from '@playwright/test';

/**
 * API tests for DemoQA BookStore API
 * API documentation: https://demoqa.com/swagger/
 * Base URL: https://demoqa.com
 */

const API_BASE_URL = 'https://demoqa.com';

test.describe('BookStore API Tests', () => {
  test('GET /BookStore/v1/Books - should retrieve all books', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/Books`);
    
    // Verify status code
    expect(response.status()).toBe(200);
    
    // Verify response has books
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('books');
    expect(Array.isArray(responseBody.books)).toBeTruthy();
    expect(responseBody.books.length).toBeGreaterThan(0);
    
    // Verify book structure
    const firstBook = responseBody.books[0];
    expect(firstBook).toHaveProperty('isbn');
    expect(firstBook).toHaveProperty('title');
    expect(firstBook).toHaveProperty('subTitle');
    expect(firstBook).toHaveProperty('author');
    expect(firstBook).toHaveProperty('publish_date');
    expect(firstBook).toHaveProperty('publisher');
    expect(firstBook).toHaveProperty('pages');
    expect(firstBook).toHaveProperty('description');
    expect(firstBook).toHaveProperty('website');
  });

  test('GET /BookStore/v1/Book - should retrieve a specific book by ISBN', async ({ request }) => {
    // First get all books to get a valid ISBN
    const booksResponse = await request.get(`${API_BASE_URL}/BookStore/v1/Books`);
    const booksData = await booksResponse.json();
    const isbn = booksData.books[0].isbn;
    
    // Get specific book
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/Book`, {
      params: {
        ISBN: isbn
      }
    });
    
    // Verify status code
    expect(response.status()).toBe(200);
    
    // Verify response structure
    const book = await response.json();
    expect(book.isbn).toBe(isbn);
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('publisher');
  });

  test('GET /BookStore/v1/Book - should return 400 for invalid ISBN', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/Book`, {
      params: {
        ISBN: 'invalid-isbn-12345'
      }
    });
    
    // Verify status code for bad request
    expect(response.status()).toBe(400);
    
    // Verify error response
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('code');
    expect(responseBody.code).toBe('1205');
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toBe('ISBN supplied is not available in Books Collection!');
  });
});

test.describe('Account API Tests', () => {
  test('POST /Account/v1/User - should validate user creation endpoint', async ({ request }) => {
    const userData = {
      userName: `testuser_${Date.now()}`,
      password: 'Test@123456'
    };
    
    const response = await request.post(`${API_BASE_URL}/Account/v1/User`, {
      data: userData
    });
    
    // Note: This might fail if the user already exists or if there are rate limits
    // We're mainly testing the API endpoint structure
    const responseBody = await response.json();
    
    if (response.status() === 201) {
      // Successful creation
      expect(responseBody).toHaveProperty('userID');
      expect(responseBody).toHaveProperty('username');
      expect(responseBody.username).toBe(userData.userName);
    } else if (response.status() === 400) {
      // User already exists or validation error
      expect(responseBody).toHaveProperty('code');
      expect(responseBody).toHaveProperty('message');
    }
  });

  test('POST /Account/v1/GenerateToken - should validate token generation endpoint', async ({ request }) => {
    const credentials = {
      userName: 'testuser',
      password: 'Test@123'
    };
    
    const response = await request.post(`${API_BASE_URL}/Account/v1/GenerateToken`, {
      data: credentials
    });
    
    // Get response body
    const responseBody = await response.json();
    
    // Either successful token generation or authentication error
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('expires');
      expect(responseBody).toHaveProperty('status');
      expect(responseBody.status).toBe('Success');
    } else {
      // Invalid credentials
      expect(responseBody).toHaveProperty('code');
      expect(responseBody).toHaveProperty('message');
    }
  });

  test('POST /Account/v1/Authorized - should check authorization endpoint', async ({ request }) => {
    const credentials = {
      userName: 'testuser',
      password: 'Test@123'
    };
    
    const response = await request.post(`${API_BASE_URL}/Account/v1/Authorized`, {
      data: credentials
    });
    
    // Verify response
    expect(response.status()).toBe(200);
    
    // Response should be a boolean indicating if user is authorized
    const responseBody = await response.json();
    expect(typeof responseBody).toBe('boolean');
  });
});

test.describe('API Error Handling', () => {
  test('should handle missing parameters gracefully', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/Book`);
    
    // Should return error for missing ISBN parameter
    expect([400, 404]).toContain(response.status());
  });

  test('should validate Content-Type headers', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/Books`);
    
    // Verify Content-Type is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should handle non-existent endpoints', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/BookStore/v1/NonExistentEndpoint`);
    
    // Should return 404 for non-existent endpoints
    expect(response.status()).toBe(404);
  });
});
