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
	- `web/`: Pasta reservada para futuros testes Web (POM já disponível em `pages/`).
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