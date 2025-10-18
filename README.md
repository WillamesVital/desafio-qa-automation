# desafio-qa-automation

Este repositório contém testes automatizados com Playwright, incluindo testes de API para a DemoQA (Account e BookStore) e base para testes Web seguindo POM (Page Object Model).

## Como rodar

```powershell
# instalar dependências
npm ci

# executar a suíte
npm test

# abrir UI runner (opcional)
npm run test:ui

# abrir o relatório HTML (após uma execução)
npm run test:report
```

## Estrutura do projeto

- `playwright.config.js`
	- Configuração do Playwright. Inclui um projeto `api` que executa apenas arquivos em `tests/api/**` e ignora esses testes nos projetos de browser (chromium, firefox, webkit).

- `package.json`
	- Scripts: `test`, `test:ui`, `test:report`.

- `.github/workflows/playwright.yml`
	- Pipeline de CI para executar os testes no GitHub Actions.

- `.vscode/tasks.json`
	- Tarefa para executar `npm test` a partir do VS Code (facilita via Terminal > Run Task).

- `.gitignore`, `package-lock.json`
	- Arquivos de controle padrão do Node/Playwright.

### Pastas

- `tests/`
	- `example.spec.js`: Exemplo básico gerado pelo Playwright.
	- `web/`: Testes Web (POM em `pages/`).
		- `practice-form.spec.js`: Fluxo completo do formulário de prática (preencher, submeter, validar popup e fechar).
		- `browser-windows.spec.js`: Abrir página "Browser Windows", clicar em "New Window", validar o texto "This is a sample page" na nova janela e fechá-la.
		- `web-tables.spec.js`: Fluxo de Web Tables (criar, editar e deletar registro) e bônus de criar 12 registros dinamicamente e deletá-los.
		- `widgets-progress-bar.spec.js`: Fluxo de Widgets > Progress Bar (iniciar, parar ≤25%, completar e resetar).
		- `interactions-sortable.spec.js`: Fluxo de Interactions > Sortable (List) para ordenar itens em ordem crescente.
	- `api/`
		- `demoqa-account-bookstore.spec.js`: Teste de API end-to-end que cobre o fluxo na DemoQA:
			1) Criar usuário (`POST /Account/v1/User`)
			2) Gerar token (`POST /Account/v1/GenerateToken`)
			3) Verificar autorização (`POST /Account/v1/Authorized`)
			4) Listar livros (`GET /BookStore/v1/Books`)
			5) Adicionar dois livros ao usuário (`POST /BookStore/v1/Books`)
			6) Detalhar usuário e validar livros (`GET /Account/v1/User/{userId}`)
			- Limpeza: ao final do fluxo, tenta remover o usuário via `DELETE /Account/v1/User/{userId}` (afterEach no teste final; fallback no afterAll).
		- `README-api-tests.md`: Instruções rápidas específicas para os testes de API.

- `helpers/`
	- `apiClient.js`: Clientes HTTP para a API DemoQA.
		- `AccountClient`: cria usuário, gera token, verifica autorização, obtém e deleta usuário.
		- `BookStoreClient`: lista livros, adiciona livros ao usuário.
	- `config.js`: URLs base das APIs (Account e BookStore).
	- `dataFactory.js`: Utilitários para gerar dados (ex.: `genUsername`, `genValidPassword`).

- `pages/`
	- `Account/LoginPage.js`: POM simples da página de Login da DemoQA (`/login`).
		- Métodos: `goto()`, `login(username, password)`, `isLoggedInAs(username)`.
	- `BookStore/BooksPage.js`: POM da página de Livros (`/books`).
		- Métodos: `goto()`, `search(query)`, `listDisplayedTitles()`.
	- `Forms/PracticeFormPage.js`: POM do formulário de prática (`/automation-practice-form`).
		- Métodos principais:
			- `goto()` — navega direto para o formulário.
			- `fillForm(data)` — preenche todos os campos; após cada ação, faz uma verificação para garantir que o valor foi de fato aplicado (mais estabilidade).
			- `verifyFilled()` — validação rápida de campos obrigatórios antes do submit.
			- `submit(options)` — valida completude e clica em Submit.
			- `isPopupVisible()` — aguarda a abertura do modal de confirmação.
			- `closePopup()` — fecha o modal com tratamento para overlays/ads.
		- `Interactions/SortablePage.js`: POM do Sortable (`/sortable`).
			- Métodos: `goto()`, `ensureListTab()`, `getListTexts()`, `sortListAscending()` com drag-and-drop resiliente (usa `dragTo` e fallback de mouse com `boundingBox`).

## Notas sobre o fluxo de API (DemoQA)

- O “aluguel” de livros foi mapeado para a adição de livros à coleção do usuário via `POST /BookStore/v1/Books`.
- O teste aceita `200` ou `201` ao adicionar livros, pois a API pública pode variar a resposta conforme o estado.
- A limpeza de dados tenta remover o usuário criado ao final (após o último teste do fluxo); se algum teste anterior falhar, há um fallback no `afterAll`.

## Referências

- Swagger DemoQA: https://demoqa.com/swagger/#/
- Documentação Playwright: https://playwright.dev/docs/intro

## Testes Web – Practice Form (DemoQA)

Arquivo: `tests/web/practice-form.spec.js`

Fluxo coberto:
- Acessar https://demoqa.com/
- Entrar em "Forms" na home
- Abrir "Practice Form" (https://demoqa.com/automation-practice-form)
- Preencher o formulário inteiro com dados aleatórios (nome, email, gênero, celular, data de nascimento, subjects, hobbies, upload, endereço, estado e cidade)
- Submeter o formulário
- Validar que o popup de confirmação abriu e contém o texto "Thanks for submitting the form"
- Fechar o popup

Páginas usadas (POM):
- `pages/HomePage.js` — acessa o site e abre a seção Forms
- `pages/Forms/PracticeFormPage.js` — interação com o formulário, validações e popup

Arquivo de upload:
- `tests/assets/upload/sample.txt` — arquivo .txt de exemplo versionado no repositório para o campo de upload

### Workaround para fechamento do popup (registro)

Contexto: na página pública da DemoQA, o botão de fechar do popup pode ficar encoberto por anúncios/overlays (ex.: `#fixedban`, iframes de ads, footer). Em alguns cenários, até manualmente é difícil fechar sem diminuir o zoom ou clicar fora.

Abordagens consideradas:
- A) Zoom/Viewport (adotada neste teste)
	- No teste `tests/web/practice-form.spec.js`, aplicamos um ajuste visual antes do submit para garantir que o botão não fique encoberto:
		- Quando suportado, aplicamos `document.body.style.zoom` para reduzir o zoom da página.
		- Em navegadores que não suportam CSS `zoom`, aumentamos temporariamente a altura do viewport para dar mais espaço e, ao final, restauramos.
	- Vantagem: simples e eficaz para a página pública de demonstração.

- B) Remoção de overlays/ads (alternativa disponível)
	- Existe uma rotina `_dismissOverlays()` em `pages/Forms/PracticeFormPage.js` que remove banners/overlays comuns (ex.: `#fixedban`, iframes de ads, elementos `position: fixed` fora do modal) e pode ser chamada antes de clicar no botão.
	- Vantagem: mantém o zoom original, reduzindo interferências visuais.

Decisão neste projeto: usar a abordagem A (Zoom/Viewport) no teste web para estabilizar a execução. A abordagem B permanece disponível no POM como alternativa.

Observação importante (caso real):
- Em um produto real, essa situação seria reportada como bug de usabilidade/UX (botão crítico encoberto por ads/overlays). O workaround é apenas para a página pública de demonstração e não substitui a correção de UI.

## Testes Web – Browser Windows (DemoQA)

Arquivo: `tests/web/browser-windows.spec.js`

Fluxo coberto:
- Acessar https://demoqa.com/
- Entrar em "Alerts, Frame & Windows"
- Abrir "Browser Windows" (https://demoqa.com/browser-windows)
- Clicar em "New Window" e capturar a nova janela
- Validar que a nova janela exibe o texto "This is a sample page"
- Fechar a nova janela

Páginas usadas (POM):
- `pages/HomePage.js` — acessa o site e abre a seção "Alerts, Frame & Windows"
- `pages/Windows/BrowserWindowsPage.js` — abre a página Browser Windows e lida com a nova janela

## Testes Web – Web Tables (DemoQA)

Arquivo: `tests/web/web-tables.spec.js`

Fluxo coberto:
- Acessar https://demoqa.com/
- Entrar em "Elements"
- Abrir "Web Tables" (https://demoqa.com/webtables)
- Criar um novo registro
- Editar o registro criado
- Deletar o registro criado

Bônus (data-driven):
- Criar 12 novos registros dinamicamente
- Validar que todos existem
- Deletar todos os criados

Páginas usadas (POM):
- `pages/HomePage.js` — acessa o site e abre a seção "Elements"
- `pages/Elements/WebTablesPage.js` — navega à página de Web Tables, cria/edita/deleta registros

## Testes Web – Widgets > Progress Bar (DemoQA)

Arquivo: `tests/web/widgets-progress-bar.spec.js`

Fluxo coberto:
- Acessar https://demoqa.com/
- Entrar em "Widgets"
- Abrir "Progress Bar" (https://demoqa.com/progress-bar)
- Clicar em Start
- Parar a barra antes dos 25%
- Validar que o valor da progress bar é menor ou igual a 25%
- Clicar Start novamente, aguardar chegar a 100% e então clicar em Reset

Páginas usadas (POM):
- `pages/HomePage.js` — acessa o site e abre a seção "Widgets"
- `pages/Widgets/ProgressBarPage.js` — navega à página de Progress Bar, inicia/para, lê o valor e reseta

Notas técnicas:
- O valor é lido de `#progressBar .progress-bar` via `aria-valuenow` (fallback para o texto, ex.: "6%").
- Para reduzir flakiness, o teste aguarda o valor atingir pelo menos 10% antes de pausar, garantindo que a verificação `≤ 25%` seja consistente.
- Navegação resiliente (`robustGoto`) e bloqueio de anúncios (`setupAdBlock`) ajudam a mitigar instabilidades do site público.

## Testes Web – Interactions > Sortable (DemoQA)

Arquivo: `tests/web/interactions-sortable.spec.js`

Fluxo coberto:
- Acessar https://demoqa.com/
- Entrar em "Interactions"
- Abrir "Sortable" (https://demoqa.com/sortable) e garantir a aba "List" ativa
- Em alguns ambientes, os itens já aparecem na ordem correta por padrão; para validar o comportamento de ordenação, primeiro embaralhamos a lista e só então reordenamos
- Reordenar os itens para a ordem crescente: One, Two, Three, Four, Five, Six
- Validar a ordem final

Páginas usadas (POM):
- `pages/HomePage.js` — acessa o site e abre a seção "Interactions"
- `pages/Interactions/SortablePage.js` — navega ao Sortable, lê itens e reordena com drag-and-drop

Notas técnicas:
- O POM tenta `locator.dragTo()` e, em caso de falha (ambientes sem suporte pleno de DnD), faz fallback com ações de mouse (`mouse.down/move/up`) baseadas em `boundingBox`.
- Após cada movimentação, é aplicada uma pequena espera para o reflow da lista.
 - Implementamos `shuffleList()` com 2–3 movimentos determinísticos (ex.: mover `Six` → posição 0, `Four` → posição 2, `Two` → posição 4) para garantir que a lista fique fora de ordem antes de ordenar.

### Instabilidade conhecida: 502 Bad Gateway (DemoQA)

Problema:
- O site público da DemoQA pode responder com páginas de erro como "502 Bad Gateway" (nginx), de forma intermitente, especialmente em horários de pico.

Como contornamos neste projeto:
- Implementamos uma navegação resiliente via `helpers/webUtils.js`:
	- `setupAdBlock(page)`: bloqueia domínios comuns de ads/trackers para reduzir interferências e overlays.
	- `robustGoto(page, url, options)`: faz `goto` com retries e backoff para status 502/503/504, detecta o texto "502 Bad Gateway" no título/corpo e tenta recarregar antes de falhar.
- Atualizamos as POMs para usar essas rotinas:
	- `pages/HomePage.js` → `goto()` chama `setupAdBlock` + `robustGoto('https://demoqa.com/')`
	- `pages/Windows/BrowserWindowsPage.js` → `goto()` usa `robustGoto('https://demoqa.com/browser-windows')`

Observação importante:
- Mesmo com retries e bloqueio de anúncios, por se tratar de um ambiente público e fora do controle, ainda pode haver instabilidade. Caso persistam falhas, é recomendável reexecutar os testes ou aumentar as tentativas/intervalos de `robustGoto`.

## Padrão de passos com test.step (Gherkin)

Os testes adotam `test.step` do Playwright para descrever ações e expectativas em passos no estilo Gherkin (Given/When/Then/And). Benefícios:
- Relatórios mais legíveis, com cada etapa explicitada
- Padronização sem introduzir dependência de BDD externo
- Facilita troubleshooting ao saber em qual passo falhou

Exemplo (Web):

```js
import { test, expect } from '@playwright/test';

test('Exemplo Web com steps', async ({ page }) => {
	await test.step('Given que acesso a home', async () => {
		await page.goto('https://demoqa.com/');
	});

	await test.step('When navego até Forms', async () => {
		await page.getByText('Forms').click();
	});

	await test.step('Then devo ver a seção de Practice Form', async () => {
		await expect(page.getByText('Practice Form')).toBeVisible();
	});
});
```

Exemplo (API):

```js
import { test, expect, request } from '@playwright/test';

test('Exemplo API com steps', async () => {
	const api = await request.newContext();
	let userId, token;

	await test.step('Given que crio um usuário válido', async () => {
		const res = await api.post('/Account/v1/User', { data: { userName: 'u', password: 'P@ssw0rd!' } });
		expect(res.status()).toBe(201);
		userId = (await res.json()).userID;
	});

	await test.step('When gero um token', async () => {
		const res = await api.post('/Account/v1/GenerateToken', { data: { userName: 'u', password: 'P@ssw0rd!' } });
		expect(res.status()).toBe(200);
		token = (await res.json()).token;
	});

	await test.step('Then o usuário deve estar autorizado', async () => {
		const res = await api.post('/Account/v1/Authorized', { data: { userName: 'u', password: 'P@ssw0rd!' } });
		expect(res.status()).toBe(200);
		expect(await res.json()).toBe(true);
	});
});
```

Uso no projeto:
- `tests/web/practice-form.spec.js`: passos Gherkin para navegação, preenchimento, workaround (zoom/viewport), submit, verificação e fechamento do popup.
- `tests/web/browser-windows.spec.js`: passos Gherkin para navegação, abertura de nova janela, validação de texto e fechamento.
- `tests/api/demoqa-account-bookstore.spec.js`: passos Gherkin cobrindo criação de usuário, geração de token, autorização, listagem e adição de livros, e verificação final do usuário.

## CI no GitHub (GitHub Actions)

Arquivo do workflow: `.github/workflows/playwright.yml`

Eventos que disparam:
- push e pull_request para os branches `main` e `master`.

Jobs configurados:
- API Tests
	- Instala dependências e browsers do Playwright.
	- Executa apenas o projeto de API: `npx playwright test --project=api`.
	- Publica o relatório como artefato: `playwright-report-api`.

- Web Tests
	- Depende do job de API (executa depois que o API Tests concluir com sucesso).
	- Instala dependências e browsers do Playwright.
	- Executa os projetos de navegador: `chromium`, `firefox`, `webkit`.
	- Publica o relatório como artefato: `playwright-report-web`.

Como reproduzir localmente os mesmos comandos do CI:
- Somente API:
	- `npx playwright test --project=api`
- Somente Web (todos navegadores):
	- `npx playwright test --project=chromium --project=firefox --project=webkit`
- Abrir relatório local após uma execução:
	- `npx playwright show-report`

Notas e melhorias possíveis:
- É possível paralelizar totalmente removendo a dependência do job Web sobre o API (`needs: api-tests`), caso deseje executar ambos em paralelo.
- Se necessário, você pode adicionar cache de `node_modules`/Playwright com `actions/cache` para acelerar as execuções.
- Os testes utilizam a API pública DemoQA; em caso de instabilidades externas, os testes de API aceitam variações de status (200/201/204) e têm limpeza de usuário ao final do fluxo.