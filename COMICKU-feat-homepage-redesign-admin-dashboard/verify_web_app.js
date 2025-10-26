import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Log all network requests
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
  console.log('Screenshot taken. Check screenshot.png');
})();
