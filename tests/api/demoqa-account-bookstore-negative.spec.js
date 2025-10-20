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
    let resWeak;

    await test.step('When tento criar usuário com senha fraca', async () => {
      resWeak = await account.createUser({ userName: username, password: weakPassword });
    });

    await test.step('Then devo receber 400 e mensagem indicando senha inválida', async () => {
      if (resWeak.status() !== 400) {
        await testInfo.attach('weak-password-response.txt', { body: await resWeak.text(), contentType: 'text/plain' });
      }
      expect(resWeak.status()).toBe(400);
      const body = await resWeak.json();
      expect(body.message || body.Message).toMatch(/password/i);
    });
  });

  test('gerar token com credenciais inválidas -> 200 com status Failed', async ({}, testInfo) => {
    let resToken;
    await test.step('When tento gerar token com credenciais inválidas', async () => {
      resToken = await account.generateToken({ userName: 'nonexistent_user', password: 'Wrong@123' });
    });

    await test.step('Then devo receber 200 com status Failed', async () => {
      if (resToken.status() !== 200) {
        await testInfo.attach('invalid-token-response.txt', { body: await resToken.text(), contentType: 'text/plain' });
      }
      expect(resToken.status()).toBe(200);
      const body = await resToken.json();
      expect(body.status).toMatch(/failed/i);
      if (body.result) expect(body.result).toMatch(/authorization failed/i);
    });
  });

  test('authorized com user inexistente -> false/404', async ({}, testInfo) => {
    let resAuth;
    await test.step('When verifico autorização de usuário inexistente', async () => {
      resAuth = await account.isAuthorized({ userName: 'ghost_user', password: 'Ghost@1234' });
    });

    await test.step('Then devo receber 404 ou 200 com false', async () => {
      const status = resAuth.status();
      if (![200, 404].includes(status)) {
        await testInfo.attach('authorized-nonexistent-user.txt', { body: await resAuth.text(), contentType: 'text/plain' });
      }
      expect([200, 404]).toContain(status);
      if (status === 200) {
        const isAuth = await resAuth.json();
        expect(isAuth).toBe(false);
      }
    });
  });

  test('adicionar livro com ISBN inválido -> 400 com mensagem', async ({}, testInfo) => {
    let token;
    let userId;
    const username = genUsername();
    const password = 'Str0ng@Pwd1';
    let resInvalidIsbn;

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
      resInvalidIsbn = await bookstore.addBooks(userId, token, [{ isbn: 'INVALID-ISBN-123' }]);
    });

    await test.step('Then devo receber 400 e mensagem de ISBN inválido/não disponível', async () => {
      if (resInvalidIsbn.status() !== 400) {
        await testInfo.attach('invalid-isbn-response.txt', { body: await resInvalidIsbn.text(), contentType: 'text/plain' });
      }
      expect(resInvalidIsbn.status(), await resInvalidIsbn.text()).toBe(400);
      const body = await resInvalidIsbn.json().catch(() => ({}));
      if (body.message) expect(body.message).toMatch(/isbn.*(invalid|not available)/i);
    });

    await test.step('And faço a limpeza removendo o usuário de teste', async () => {
      try {
        await account.deleteUser(userId, token);
      } catch {}
    });
  });
});
