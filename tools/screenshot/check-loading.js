const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const ctx = await browser.newContext({ viewport: { width: 720, height: 1280 } });
  const page = await ctx.newPage();
  page.on('console', m => console.log('[console]', m.type(), m.text().slice(0, 200)));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  page.on('requestfailed', r => console.log('[reqfail]', r.url().slice(0, 80), r.failure()?.errorText));
  await page.goto('https://hoatv2211.github.io/Share001_Ludo/', { waitUntil: 'domcontentloaded' });
  // Sample at 10s, 20s
  for (let t of [10, 20, 30]) {
    await page.waitForTimeout(t === 10 ? 10000 : 10000);
    const info = await page.evaluate(() => {
      const c = document.querySelector('#unity-canvas');
      const lb = document.querySelector('#unity-loading-bar');
      const lbText = document.querySelector('#unity-loading-text, .loading-text, [class*="loading"]');
      return {
        canvas: c ? `${c.width}x${c.height}` : null,
        loadingBarDisplay: lb ? lb.style.display : null,
        bodyText: document.body.innerText.slice(0, 200),
      };
    });
    console.log(`[t=${t}s]`, JSON.stringify(info));
  }
  // Take a real viewport screenshot and save
  const session = await ctx.newCDPSession(page);
  const r = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('../../docs/assets/game-icons/_debug.png', Buffer.from(r.data, 'base64'));
  console.log('[saved] ../../docs/assets/game-icons/_debug.png');
  await browser.close();
})();
