import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage.js';
import { ProgressBarPage } from '../../pages/Widgets/ProgressBarPage.js';

test('Widgets > Progress Bar - iniciar, parar <=25%, completar e resetar', async ({ page }) => {
    const home = new HomePage(page);
    const progress = new ProgressBarPage(page);

    await test.step('Given que acesso a home e navego até Progress Bar', async () => {
        await home.goto();
        await home.openWidgets();
        await progress.goto();
    });

    await test.step('When clico em Start e paro antes de 25%', async () => {
        await progress.start();
        await progress.waitUntilValueAtLeast(24, 4000);
        await progress.stop();
    });

    await test.step('Then o valor da progress bar deve ser <= 25%', async () => {
        const value = await progress.getValueNow();
        expect(value).toBeLessThanOrEqual(25);
        console.log(`Valor da progress bar após stop: ${value}%`);
        await page.screenshot({ path: 'tests/assets/screenshots/progress-bar-stopped.png' });
    });

    await test.step('And volto a Start até chegar a 100% e então reseto', async () => {
        await progress.start();
        await progress.waitUntilComplete(12_000);
        const finalValue = await progress.getValueNow();
        expect(finalValue).toBe(100);
        console.log(`Valor da progress bar ao completar: ${finalValue}%`);

        await progress.reset();
        const afterReset = await progress.getValueNow();
        expect(afterReset).toBe(0);
        await page.screenshot({ path: 'tests/assets/screenshots/progress-bar-reset.png' });
    });
});
