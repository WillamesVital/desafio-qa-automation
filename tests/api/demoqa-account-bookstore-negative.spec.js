import { test, expect, request as apiRequest } from '@playwright/test';
import { AccountClient, BookStoreClient } from '../../helpers/apiClient.js';
import { genUsername } from '../../helpers/dataFactory.js';


test.describe('DemoQA API - cenários negativos', () => {
  let apiCtx;
  let account;
  let bookstore;
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const retryRequest = async (fn, { maxRetries = 5, baseDelay = 1000 } = {}) => {
    let lastStatus;
    for (let i = 0; i < maxRetries; i++) {
      const res = await fn();
      lastStatus = res.status();
      if (lastStatus < 500) {
        return { res, lastStatus };
      }
      // backoff exponencial com jitter
      const jitter = Math.floor(Math.random() * 300);
      const delay = baseDelay * Math.pow(2, i) + jitter;
      await sleep(delay);
    }
    return { res: null, lastStatus };
  };

  test.beforeAll(async () => {
    apiCtx = await apiRequest.newContext();
    account = new AccountClient(apiCtx);
    bookstore = new BookStoreClient(apiCtx);
  });

  test.afterAll(async () => {
    await apiCtx.dispose();
  });

  test('senha fraca ao criar usuário -> 400 e mensagem', async ({}, testInfo) => {
    const username = genUsername();
    const weakPassword = 'abc123';

    await test.step('When tento criar usuário com senha fraca', async () => {
      const res = await account.createUser({ userName: username, password: weakPassword });
      if (res.status() !== 400) {
        await testInfo.attach('weak-password-response.txt', { body: await res.text(), contentType: 'text/plain' });
      }
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.message || body.Message).toMatch(/password/i);
    });
  });

  test('gerar token com credenciais inválidas -> 200 com status Failed', async ({}, testInfo) => {
    await test.step('When tento gerar token com credenciais inválidas', async () => {
      const res = await account.generateToken({ userName: 'nonexistent_user', password: 'Wrong@123' });
      if (res.status() !== 200) {
        await testInfo.attach('invalid-token-response.txt', { body: await res.text(), contentType: 'text/plain' });
      }
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toMatch(/failed/i);
      if (body.result) expect(body.result).toMatch(/authorization failed/i);
    });
  });

  test('authorized com user inexistente -> false/404', async ({}, testInfo) => {
    await test.step('When verifico autorização de usuário inexistente', async () => {
      const res = await account.isAuthorized({ userName: 'ghost_user', password: 'Ghost@1234' });
      const status = res.status();
      if (![200, 404].includes(status)) {
        await testInfo.attach('authorized-nonexistent-user.txt', { body: await res.text(), contentType: 'text/plain' });
      }
      expect([200, 404]).toContain(status);
      if (status === 200) {
        const isAuth = await res.json();
        expect(isAuth).toBe(false);
      }
    });
  });

  test('adicionar livro com ISBN inválido -> 400 com mensagem', async ({}, testInfo) => {
    let token;
    let userId;
    const username = genUsername();
    const password = 'Str0ng@Pwd1';

    await test.step('Given que tenho um usuário válido com token', async () => {
      const { res: create, lastStatus: createStatus } = await retryRequest(
        () => account.createUser({ userName: username, password })
      );
      if (!create || createStatus !== 201) {
        if (create) await testInfo.attach('create-user-response.txt', { body: await create.text(), contentType: 'text/plain' });
        throw new Error(`Falha ao criar usuário após retries. Último status: ${createStatus}`);
      }
      userId = (await create.json()).userID;

      const { res: genTok, lastStatus: tokenStatus } = await retryRequest(
        () => account.generateToken({ userName: username, password })
      );
      if (!genTok || tokenStatus !== 200) {
        if (genTok) await testInfo.attach('generate-token-response.txt', { body: await genTok.text(), contentType: 'text/plain' });
        throw new Error(`Falha ao gerar token após retries. Último status: ${tokenStatus}`);
      }
      token = (await genTok.json()).token;
    });

    await test.step('When tento adicionar um ISBN inválido', async () => {
      const res = await bookstore.addBooks(userId, token, [{ isbn: 'INVALID-ISBN-123' }]);
      if (res.status() !== 400) {
        await testInfo.attach('invalid-isbn-response.txt', { body: await res.text(), contentType: 'text/plain' });
      }
      expect(res.status(), await res.text()).toBe(400);
      const body = await res.json().catch(() => ({}));
      if (body.message) expect(body.message).toMatch(/isbn.*not available/i);
    });

    await test.step('And faço a limpeza removendo o usuário de teste', async () => {
      try {
        await account.deleteUser(userId, token);
      } catch {}
    });
  });
});
