# Desafio QA Automation - Playwright

Este repositório contém a automação de testes para o desafio técnico de QA, utilizando Playwright para testes Web e API.

## 🎯 Objetivo

Automatizar testes para a plataforma DemoQA:
- **Testes Web**: https://demoqa.com/automation-practice-form
- **Testes API**: https://demoqa.com/swagger/

## 🚀 Tecnologias Utilizadas

- **Playwright**: Framework de automação de testes
- **TypeScript**: Linguagem de programação
- **Node.js**: Ambiente de execução

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/WillamesVital/desafio-qa-automation.git
cd desafio-qa-automation
```

2. Instale as dependências:
```bash
npm install
```

3. Instale os navegadores do Playwright:
```bash
npx playwright install
```

## 🧪 Executando os Testes

### Todos os testes
```bash
npm test
```

### Apenas testes Web
```bash
npm run test:web
```

### Apenas testes API
```bash
npm run test:api
```

### Modo debug (com interface visual)
```bash
npm run test:debug
```

### Modo headed (mostra o navegador)
```bash
npm run test:headed
```

### Interface interativa (UI Mode)
```bash
npm run test:ui
```

### Visualizar relatório de testes
```bash
npm run test:report
```

## 📁 Estrutura do Projeto

```
desafio-qa-automation/
├── tests/
│   ├── web/                    # Testes de interface web
│   │   └── practice-form.spec.ts
│   └── api/                    # Testes de API
│       └── bookstore.spec.ts
├── playwright.config.ts        # Configuração do Playwright
├── tsconfig.json              # Configuração do TypeScript
├── package.json               # Dependências do projeto
└── README.md                  # Documentação
```

## 🧪 Testes Implementados

### Testes Web (Practice Form)
- ✅ Carregamento da página do formulário
- ✅ Validação de campos visíveis
- ✅ Preenchimento e submissão completa do formulário
- ✅ Validação de formato de email
- ✅ Validação de campos obrigatórios
- ✅ Upload de arquivos

### Testes API (BookStore)
- ✅ Listagem de todos os livros (GET /BookStore/v1/Books)
- ✅ Busca de livro por ISBN (GET /BookStore/v1/Book)
- ✅ Validação de ISBN inválido
- ✅ Criação de usuário (POST /Account/v1/User)
- ✅ Geração de token (POST /Account/v1/GenerateToken)
- ✅ Verificação de autorização (POST /Account/v1/Authorized)
- ✅ Tratamento de erros e validações

## 📊 Relatórios

Após executar os testes, um relatório HTML é gerado automaticamente. Para visualizá-lo:
```bash
npm run test:report
```

## 🎯 Browsers Suportados

Os testes são executados nos seguintes navegadores:
- Chromium
- Firefox
- WebKit (Safari)

## 📝 Notas

- Os testes são executados em paralelo por padrão
- Screenshots são capturadas automaticamente em caso de falha
- Traces são coletados na primeira tentativa de retry
- Configuração otimizada para CI/CD

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

ISC