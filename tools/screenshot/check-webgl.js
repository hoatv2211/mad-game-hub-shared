const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const ctx = await browser.newContext({ viewport: { width: 720, height: 1280 } });
  const page = await ctx.newPage();
  page.on('console', m => console.log('[console]', m.type(), m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('https://hoatv2211.github.io/Share001_Ludo/', { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(5000);
    const info = await page.evaluate(() => {
      const c = document.querySelector('#unity-canvas') || document.querySelector('canvas');
      const lb = document.querySelector('#unity-loading-bar');
      const lbar = lb ? lb.style.display : 'no-bar';
      let hasGL = false;
      if (c) {
        hasGL = !!(c.getContext('webgl2') || c.getContext('webgl'));
      }
      const err = document.querySelector('#unity-webgl-error, .webgl-error');
      return { hasCanvas: !!c, hasGL, loadingBar: lbar, err: err ? err.innerText : null };
    });
    console.log(`[t=${(i+1)*5}s]`, JSON.stringify(info));
  }
  await browser.close();
})();
