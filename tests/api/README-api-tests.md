# Testes de API - DemoQA

Este conjunto cobre o fluxo:

- Criar um usuário
- Gerar um token de acesso
- Confirmar se o usuário está autorizado
- Listar os livros disponíveis
- Adicionar ("alugar") dois livros para o usuário
- Listar os detalhes do usuário e validar os livros

Arquivo principal: `tests/api/demoqa-account-bookstore.spec.js`.

Pré-requisitos:
- Node.js LTS
- Dependências instaladas (Playwright)

Como executar:

```powershell
# instalar dependências
npm ci

# executar todos os testes
npm test

# abrir o UI runner
npm run test:ui

# abrir o relatório HTML após execução
npm run test:report
```

Notas:
- O endpoint de "alugar" é representado pela adição de livros à coleção do usuário (`POST /BookStore/v1/Books`).
- Os testes rodam em `describe.serial` para compartilhar `userId`, `token` e a lista de livros entre etapas.
- Em caso de flutuações da API pública, o teste aceita 200 ou 201 ao adicionar livros e confirma no GET final.
- As credenciais são geradas dinamicamente por teste para evitar conflitos.
