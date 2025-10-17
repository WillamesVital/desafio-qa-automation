# Guia de Contribuição

## Como Contribuir

Obrigado por seu interesse em contribuir com este projeto! Este guia irá ajudá-lo a começar.

## Configuração do Ambiente de Desenvolvimento

### Requisitos
- Node.js 16.x ou superior
- npm ou yarn
- Git

### Instalação Local

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

## Estrutura dos Testes

### Testes Web
Os testes web estão localizados em `tests/web/` e focam na automação da interface do usuário.

**Padrões para testes web:**
- Use seletores específicos e estáveis (IDs preferidos)
- Evite esperas fixas - use `waitForSelector` quando necessário
- Verifique estados antes de interagir com elementos
- Capture screenshots em caso de falha (automático)

### Testes API
Os testes API estão em `tests/api/` e validam endpoints REST.

**Padrões para testes API:**
- Verifique status codes
- Valide estrutura de resposta
- Teste casos de erro e edge cases
- Use dados dinâmicos quando possível

## Executando Testes

### Durante o Desenvolvimento
```bash
# Modo interativo (UI)
npm run test:ui

# Modo debug
npm run test:debug

# Com navegador visível
npm run test:headed
```

### Testes Específicos
```bash
# Executar arquivo específico
npx playwright test tests/web/practice-form.spec.ts

# Executar teste específico por nome
npx playwright test -g "should load the practice form page"
```

## Convenções de Código

### Nomenclatura
- **Arquivos de teste**: `*.spec.ts`
- **Describes**: Descrever o componente/módulo sendo testado
- **Tests**: Começar com "should" e descrever o comportamento esperado

### Estrutura de um Teste
```typescript
test.describe('Nome do Componente', () => {
  test.beforeEach(async ({ page }) => {
    // Setup comum
  });

  test('should fazer algo específico', async ({ page }) => {
    // Arrange - preparar
    
    // Act - executar ação
    
    // Assert - verificar resultado
  });
});
```

## Adicionando Novos Testes

1. Identifique a categoria (web ou api)
2. Crie ou edite o arquivo de spec apropriado
3. Siga as convenções de nomenclatura
4. Adicione comentários quando necessário
5. Execute os testes localmente
6. Faça commit com mensagem descritiva

### Exemplo de Commit
```
feat: adiciona teste de validação de CPF

- Adiciona teste para validar formato de CPF
- Testa casos válidos e inválidos
- Atualiza documentação
```

## Debugging

### Usando o Inspector
```bash
npx playwright test --debug
```

### Visualizando Traces
```bash
npx playwright show-trace test-results/[caminho-para-trace]/trace.zip
```

### Pausando a Execução
```typescript
await page.pause(); // Pausa e abre o inspector
```

## Boas Práticas

1. **Mantenha testes independentes**: Cada teste deve poder rodar isoladamente
2. **Use dados únicos**: Evite conflitos usando timestamps ou UUIDs
3. **Limpe dados**: Implemente cleanup quando criar dados persistentes
4. **Seja específico**: Assertions devem ser claras e específicas
5. **Evite timeouts longos**: Use wait conditions inteligentes
6. **Documente casos complexos**: Adicione comentários explicativos

## CI/CD

Os testes são executados automaticamente no GitHub Actions quando:
- Um PR é aberto
- Commits são feitos no PR
- Um merge é feito para a branch principal

## Dúvidas?

Se tiver dúvidas ou sugestões, abra uma issue no GitHub!
