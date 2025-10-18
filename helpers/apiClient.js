import { BASE_URLS } from './config.js';

export class AccountClient {
  constructor(request) {
    this.request = request;
    this.base = BASE_URLS.account;
  }

  async createUser(creds) {
    const res = await this.request.post(`${this.base}/User`, { data: creds });
    return res;
  }

  async generateToken(creds) {
    const res = await this.request.post(`${this.base}/GenerateToken`, { data: creds });
    return res;
  }

  async isAuthorized(creds) {
    const res = await this.request.post(`${this.base}/Authorized`, { data: creds });
    return res;
  }

  async getUser(userId, token) {
    const res = await this.request.get(`${this.base}/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  }

  async deleteUser(userId, token) {
    const res = await this.request.delete(`${this.base}/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  }
}

export class BookStoreClient {
  constructor(request) {
    this.request = request;
    this.base = BASE_URLS.bookstore;
  }

  async listBooks() {
    const res = await this.request.get(`${this.base}/Books`);
    return res;
  }

  async addBooks(userId, token, collection) {
    const res = await this.request.post(`${this.base}/Books`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, collectionOfIsbns: collection },
    });
    return res;
  }
}
