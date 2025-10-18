import { robustGoto } from '../../helpers/webUtils.js';

export class ProgressBarPage {
  constructor(page) {
    this.page = page;
    this.startStopBtn = page.locator('#startStopButton');
    this.resetBtn = page.locator('#resetButton');
    // O valor (aria-valuenow) está no elemento interno .progress-bar
    this.progressBarContainer = page.locator('#progressBar');
    this.progressBarValueEl = page.locator('#progressBar .progress-bar');
  }

  async goto() {
    await robustGoto(this.page, 'https://demoqa.com/progress-bar');
    await this.startStopBtn.waitFor({ state: 'visible' });
  }

  async start() {
    await this.startStopBtn.click();
  }

  async stop() {
    // O mesmo botão start/stop pausa quando em execução
    await this.startStopBtn.click();
  }

  async reset() {
    await this.resetBtn.click();
  }

  async getValueNow() {
    // aria-valuenow é atualizado dinamicamente (0..100) no elemento interno
    const val = await this.progressBarValueEl.getAttribute('aria-valuenow');
    if (val != null) return Number(val);
    const text = await this.progressBarValueEl.innerText().catch(() => '0'); // e.g., "6%"
    const num = parseInt((text || '0').replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(num) ? num : 0;
  }

  async waitUntilValueAtLeast(target, timeout = 5000) {
    await this.page.waitForFunction(
      (t) => {
        const el = document.querySelector('#progressBar .progress-bar');
        if (!el) return false;
        const v = Number(el.getAttribute('aria-valuenow') || '0');
        return v >= t;
      },
      target,
      { timeout }
    );
  }

  async waitUntilComplete(timeout = 10000) {
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('#progressBar .progress-bar');
        if (!el) return false;
        const v = Number(el.getAttribute('aria-valuenow') || '0');
        return v >= 100;
      },
      null,
      { timeout }
    );
  }
}
