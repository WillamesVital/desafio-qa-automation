import { test, expect, request as apiRequest } from '@playwright/test';
import { AccountClient, BookStoreClient } from '../../helpers/apiClient.js';
import { genUsername, genValidPassword } from '../../helpers/dataFactory.js';

/**
 * Fluxo coberto:
 * 1. Criar um usuário
 * 2. Gerar um token de acesso
 * 3. Verificar se o usuário está autorizado
 * 4. Listar livros disponíveis
 * 5. Alugar (adicionar) dois livros na coleção do usuário
 * 6. Listar detalhes do usuário e validar os livros
 *
 * Observação: a API do DemoQA não possui endpoint de "alugar" propriamente dito.
 * Utilizamos a coleção de livros do usuário (BookStore/Books) para adicionar livros ao usuário.
 */

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
      // Aceita 200/204/202 conforme variação da API
      if (![200, 202, 204].includes(del.status())) {
        console.warn(`Falha ao deletar usuário ${userId}: ${del.status()} - ${await del.text()}`);
      }
    }
  });

  test.afterAll(async () => {
    // Fallback caso o teste final não tenha rodado
    if (userId && token) {
      try {
        await accountClient.deleteUser(userId, token);
      } catch {}
    }
    await apiCtx.dispose();
  });

  test('criar usuário', async () => {
    await test.step('Given que eu gere um username e password válidos', async () => {
      username = genUsername();
      // Senha precisa cumprir política (letra maiúscula, minúscula, número e caractere especial, min 8)
      password = genValidPassword();
    });

    await test.step('When eu requisito a criação do usuário', async () => {
      const res = await accountClient.createUser({ userName: username, password });
      expect(res.status(), await res.text()).toBe(201);
      const body = await res.json();
      expect(body.username).toBe(username);
      expect(body.userID).toMatch(/[0-9a-fA-F-]{36}/);
      userId = body.userID;
    });
  });

  test('gerar token', async () => {
    await test.step('When eu gero um token para o usuário criado', async () => {
      const res = await accountClient.generateToken({ userName: username, password });
      expect(res.status(), await res.text()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('Success');
      expect(body.token).toBeTruthy();
      token = body.token;
    });
  });

  test('confirmar usuário autorizado', async () => {
    await test.step('Then o usuário deve estar autorizado', async () => {
      const res = await accountClient.isAuthorized({ userName: username, password });
      expect(res.status(), await res.text()).toBe(200);
      const isAuthorized = await res.json();
      expect(isAuthorized).toBe(true);
    });
  });

  test('listar livros disponíveis', async () => {
    await test.step('When eu listo os livros disponíveis', async () => {
      const res = await bookClient.listBooks();
      expect(res.status(), await res.text()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.books)).toBe(true);
      expect(body.books.length).toBeGreaterThanOrEqual(2);

      availableBooks = body.books
        .slice(0, 2)
        .map(b => ({ isbn: b.isbn, title: b.title }));
    });
  });

  test('adicionar dois livros ao usuário', async () => {
    await test.step('And eu adiciono dois livros à coleção do usuário', async () => {
      const res = await bookClient.addBooks(
        userId,
        token,
        availableBooks.map(b => ({ isbn: b.isbn }))
      );

      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      // Quando já existem, a API pode retornar uma lista dos livros ou mensagem de conflito;
      // validei que não é erro 401/403/400 e segui a verificação final no GET do usuário.
      expect(res.status()).not.toBeGreaterThan(400);
    });
  });

  test('detalhar usuário com livros escolhidos', async () => {
    await test.step('Then os detalhes do usuário devem conter os livros adicionados', async () => {
      const res = await accountClient.getUser(userId, token);
      expect(res.status(), await res.text()).toBe(200);
      const body = await res.json();

      expect(body.username).toBe(username);
      expect(Array.isArray(body.books)).toBe(true);

      const userIsbns = new Set(body.books.map(b => b.isbn));
      for (const book of availableBooks) {
        expect(userIsbns.has(book.isbn), `Livro ausente: ${book.title} (${book.isbn})`).toBe(true);
      }
    });
  });
});
