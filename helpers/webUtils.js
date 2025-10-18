/**
 * Bloqueia requisições conhecidas de ads/trackers para reduzir overlays e ruído.
 * Deve ser chamado ANTES da primeira navegação da página.
 */
export async function setupAdBlock(page) {
  const adHosts = [
    'googlesyndication.com',
    'doubleclick.net',
    'adservice.google.com',
    'googletagmanager.com',
    'google-analytics.com',
    'pubmatic.com',
    'rubiconproject.com',
    'adnxs.com',
    'criteo.com',
  ];

  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (adHosts.some((h) => url.includes(h))) return route.abort();
    return route.continue();
  });
}

/**
 * Navegação resiliente com retries para contornar erros 502/503/504 (Bad Gateway/Service Unavailable/Gateway Timeout)
 * e páginas parcialmente carregadas. Também detecta o texto "502 Bad Gateway" no título/corpo.
 */
export async function robustGoto(page, url, options = {}) {
  const tries = options.tries ?? 5;
  const waitUntil = options.waitUntil ?? 'domcontentloaded';
  const retryStatus = options.retryStatus ?? [502, 503, 504];
  const baseDelay = options.baseDelayMs ?? 500;

  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await page.goto(url, { waitUntil, timeout: options.timeout });
      const status = response?.status?.();

      // Se status for 5xx conhecido, tenta novamente
      if (status && retryStatus.includes(status)) {
        if (attempt < tries) await page.waitForTimeout(baseDelay * attempt);
        else throw new Error(`Falha de navegação: status ${status}`);
        continue;
      }

      // Detectar página de erro 502 mesmo sem status adequado
      const title = await page.title().catch(() => '');
      let badGateway = /502 Bad Gateway/i.test(title);
      if (!badGateway) {
        const bodyText = await page.locator('body').innerText().catch(() => '');
        badGateway = /502 Bad Gateway/i.test(bodyText);
      }
      if (badGateway) {
        if (attempt < tries) {
          await page.waitForTimeout(baseDelay * attempt);
          // tentar recarregar explicitamente
          await page.reload({ waitUntil }).catch(() => {});
          // loop tenta novamente com goto para consistência
          continue;
        }
        throw new Error('Página carregou com "502 Bad Gateway" repetidamente');
      }

      // Sucesso
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < tries) {
        await page.waitForTimeout(baseDelay * attempt);
        continue;
      }
      throw lastError;
    }
  }
}
