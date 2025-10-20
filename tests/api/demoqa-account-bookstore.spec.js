import { test, expect, request as apiRequest } from '@playwright/test';
import { AccountClient, BookStoreClient } from '../../helpers/apiClient.js';
import { genUsername, genValidPassword } from '../../helpers/dataFactory.js';

test.describe.serial('DemoQA - fluxo de usuário e livros (API)', () => {
  let userId;
  let username;
  let password;
  let token;

  let apiCtx;
  let accountClient;
  let bookClient;
  let availableBooks = [];

  test.beforeAll(async () => {
    apiCtx = await apiRequest.newContext();
    accountClient = new AccountClient(apiCtx);
    bookClient = new BookStoreClient(apiCtx);
  });

  const CLEANUP_TRIGGER_TEST = 'detalhar usuário com livros escolhidos';

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.title === CLEANUP_TRIGGER_TEST && userId && token) {
      const del = await accountClient.deleteUser(userId, token);
  
      if (![200, 202, 204].includes(del.status())) {
        await testInfo.attach('cleanup-delete-user-response.txt', {
          body: await del.text().catch(() => ''),
          contentType: 'text/plain'
        });
        console.warn(`Falha ao deletar usuário ${userId}: ${del.status()} - ${await del.text()}`);
      }
    }
  });

  test.afterAll(async () => {
    if (userId && token) {
      try {
        await accountClient.deleteUser(userId, token);
      } catch {}
    }
    await apiCtx.dispose();
  });

  test('criar usuário', async ({}, testInfo) => {
    let resCreate;
    await test.step('Given que eu gere um username e password válidos', async () => {
      username = genUsername();
      password = genValidPassword();
    });

    await test.step('When eu requisito a criação do usuário', async () => {
      resCreate = await accountClient.createUser({ userName: username, password });
    });

    await test.step('Then o usuário deve ser criado com sucesso (201)', async () => {
      const status = resCreate.status();
      if (status !== 201) {
        await testInfo.attach('create-user-response.txt', { body: await resCreate.text(), contentType: 'text/plain' });
      }
      expect(status, await resCreate.text()).toBe(201);
      const body = await resCreate.json();
      expect(body.username).toBe(username);
      expect(body.userID).toMatch(/[0-9a-fA-F-]{36}/);
      userId = body.userID;
    });
  });

  test('gerar token', async ({}, testInfo) => {
    let resToken;
    await test.step('When eu gero um token para o usuário criado', async () => {
      resToken = await accountClient.generateToken({ userName: username, password });
    });

    await test.step('Then devo receber 200 e um token válido', async () => {
      const status = resToken.status();
      if (status !== 200) {
        await testInfo.attach('generate-token-response.txt', { body: await resToken.text(), contentType: 'text/plain' });
      }
      expect(status, await resToken.text()).toBe(200);
      const body = await resToken.json();
      expect(body.status).toBe('Success');
      expect(body.token).toBeTruthy();
      token = body.token;
    });
  });

  test('confirmar usuário autorizado', async ({}, testInfo) => {
    let resAuth;
    await test.step('When verifico a autorização do usuário', async () => {
      resAuth = await accountClient.isAuthorized({ userName: username, password });
    });

    await test.step('Then o usuário deve estar autorizado', async () => {
      const status = resAuth.status();
      if (status !== 200) {
        await testInfo.attach('authorized-response.txt', { body: await resAuth.text(), contentType: 'text/plain' });
      }
      expect(status, await resAuth.text()).toBe(200);
      const isAuthorized = await resAuth.json();
      expect(isAuthorized).toBe(true);
    });
  });

  test('listar livros disponíveis', async ({}, testInfo) => {
    let resList;
    await test.step('When eu listo os livros disponíveis', async () => {
      resList = await bookClient.listBooks();
    });

    await test.step('Then devo receber 200 e pelo menos 2 livros', async () => {
      const status = resList.status();
      if (status !== 200) {
        await testInfo.attach('list-books-response.txt', { body: await resList.text(), contentType: 'text/plain' });
      }
      expect(status, await resList.text()).toBe(200);
      const body = await resList.json();
      expect(Array.isArray(body.books)).toBe(true);
      expect(body.books.length).toBeGreaterThanOrEqual(2);

      availableBooks = body.books
        .slice(0, 2)
        .map(b => ({ isbn: b.isbn, title: b.title }));
    });
  });

  test('adicionar dois livros ao usuário', async ({}, testInfo) => {
    let resAdd;
    await test.step('When eu adiciono dois livros à coleção do usuário', async () => {
      resAdd = await bookClient.addBooks(
        userId,
        token,
        availableBooks.map(b => ({ isbn: b.isbn }))
      );
    });

    await test.step('Then a resposta deve indicar adição bem-sucedida (200/201)', async () => {
      const status = resAdd.status();
      if (![200, 201].includes(status)) {
        await testInfo.attach('add-books-response.txt', { body: await resAdd.text(), contentType: 'text/plain' });
      }
      expect([200, 201]).toContain(status);
      // Quando já existem, a API pode variar o corpo; verificação final será no GET do usuário.
      expect(status).not.toBeGreaterThan(400);
    });
  });

  test('detalhar usuário com livros escolhidos', async ({}, testInfo) => {
    let resUser;
    await test.step('When eu consulto os detalhes do usuário', async () => {
      resUser = await accountClient.getUser(userId, token);
    });

    await test.step('Then os detalhes do usuário devem conter os livros adicionados', async () => {
      const status = resUser.status();
      if (status !== 200) {
        await testInfo.attach('get-user-response.txt', { body: await resUser.text(), contentType: 'text/plain' });
      }
      expect(status, await resUser.text()).toBe(200);
      const body = await resUser.json();

      expect(body.username).toBe(username);
      expect(Array.isArray(body.books)).toBe(true);

      const userIsbns = new Set(body.books.map(b => b.isbn));
      for (const book of availableBooks) {
        expect(userIsbns.has(book.isbn), `Livro ausente: ${book.title} (${book.isbn})`).toBe(true);
      }
    });
  });
});
