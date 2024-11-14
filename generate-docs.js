import { chromium } from 'playwright';
import { getNiceDescriptions } from './script.js';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await getNiceDescriptions({ page });

    await browser.close();
})();