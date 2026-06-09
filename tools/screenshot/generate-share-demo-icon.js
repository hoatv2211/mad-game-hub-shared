#!/usr/bin/env node
/**
 * Generate 512x512 icon from a live Unity WebGL demo at a remote URL.
 * Waits for the Unity canvas to mount (WASM init can take 15-30s on cold load),
 * then screenshots the full viewport and crops the center square.
 *
 * Usage:
 *   node generate-share-demo-icon.js <demoUrl> <outPath> [waitMs]
 *
 * Example:
 *   node generate-share-demo-icon.js https://hoatv2211.github.io/Share001_Ludo/ docs/assets/game-icons/Share001_Ludo.png 20000
 */

const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateShareDemoIcon(demoUrl, outPath, waitMs = 20000) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      '--disable-features=VizDisplayCompositor',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 720, height: 1280 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  console.log(`[open]   ${demoUrl}`);
  await page.goto(demoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Unity WebGL: wait for canvas to mount, then for it to render. We try several
  // common selectors — Unity template uses #unity-canvas, but some builds use
  // plain <canvas>. A fixed fallback wait covers the gap if no canvas shows up
  // at all (loader still spinning).
  let canvasAppeared = false;
  const canvasSelectors = ['#unity-canvas', '#gameContainer canvas', 'canvas'];
  for (const sel of canvasSelectors) {
    try {
      await page.waitForSelector(sel, { timeout: 8000, state: 'visible' });
      console.log(`[canvas] found via ${sel}`);
      canvasAppeared = true;
      break;
    } catch (e) { /* try next */ }
  }
  if (!canvasAppeared) {
    console.log('[canvas] none of the known selectors appeared, waiting fixed time');
  }

  // Give Unity time to finish loading + render first frame(s).
  // For Unity WebGL, the WASM bundle + .data file can take 20-90s on cold load
  // over GitHub Pages. We poll for the loading bar to reach 100% (game ready),
  // then click the canvas (many Unity games need a click to start), then capture.
  const maxWait = waitMs;
  const pollStart = Date.now();
  let gameReady = false;
  let lastProgress = -1;
  while (Date.now() - pollStart < maxWait) {
    const sample = await page.evaluate(() => {
      // Unity template has #unity-progress-bar with style.width as percent string
      const bar = document.querySelector('#unity-progress-bar');
      const barFull = document.querySelector('#unity-fullscreen-button, [class*="unity"]');
      const loadingBar = document.querySelector('#unity-loading-bar');
      const loadingVisible = loadingBar ? loadingBar.style.display !== 'none' : false;
      let progress = 0;
      if (bar) {
        const w = bar.style.width || '0%';
        progress = parseInt(w) || 0;
      }
      return { progress, loadingVisible };
    });
    if (sample.progress !== lastProgress) {
      console.log(`[load]   progress=${sample.progress}% loadingVisible=${sample.loadingVisible}`);
      lastProgress = sample.progress;
    }
    if (sample.progress >= 100 && !sample.loadingVisible) {
      gameReady = true;
      console.log('[load]   100% — Unity ready');
      break;
    }
    await page.waitForTimeout(2000);
  }
  if (!gameReady) {
    console.log(`[load]   timeout after ${maxWait}ms, capturing whatever is on screen`);
  }

  // Click canvas to start the game (Unity games often need a click to focus)
  await page.mouse.click(360, 640);
  await page.waitForTimeout(2000);
  await page.mouse.click(360, 640);
  await page.waitForTimeout(2000);

  // Try to dismiss any "Loading..." overlay / progress bar / play button
  await page.evaluate(() => {
    const sels = [
      'div[style*="z-index"]',
      '.splash', '.loading', '#splash', '#loading', '.preloader',
      '#unity-loading-bar', '#unity-footer',
    ];
    document.querySelectorAll(sels.join(',')).forEach((el) => {
      if (el.querySelector('canvas')) return;
      el.style.opacity = '0';
    });
    // Click any visible play / start / tap-to-continue button
    const playText = /^(play|start|continue|▶|tap\s*to\s*start|click\s*to\s*start)$/i;
    document.querySelectorAll('button, a, div').forEach((el) => {
      const t = (el.innerText || el.textContent || '').trim();
      if (t && playText.test(t) && el.offsetWidth > 0 && el.offsetHeight > 0) {
        try { el.click(); } catch {}
      }
    });
  });
  // Also tap center of canvas — many Unity games start on click
  await page.mouse.click(360, 640);
  await page.waitForTimeout(1500);
  await page.mouse.click(360, 640);
  await page.waitForTimeout(1500);

  // Playwright's screenshot always waits for document.fonts.ready, which can hang
  // forever on Unity WebGL pages. To bypass that we use a CDP raw screenshot
  // (Page.captureScreenshot) via the chromium connection — no font wait.
  // That captures the current GPU framebuffer as-is, including WebGL content.
  const session = await context.newCDPSession(page);
  const cdpResult = await session.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  const fullBuf = Buffer.from(cdpResult.data, 'base64');
  console.log(`[snap]   CDP raw screenshot (${(fullBuf.length / 1024).toFixed(1)} KB)`);
  await session.detach();

  const tmpFile = outPath + '.full.png';
  fs.writeFileSync(tmpFile, fullBuf);
  console.log(`[snap]   -> ${tmpFile}`);

  await browser.close();

  // For canvas-direct capture the image is already a rectangle of the canvas,
  // which for a portrait-viewport Unity build is roughly 720x[600-1280].
  // Pad it onto a 720x720 transparent background if it isn't already square,
  // then resize to 512x512. This preserves the full game frame in all cases.
  const meta = await sharp(fullBuf).metadata();
  const target = 720;
  const padTop = Math.max(0, Math.floor((target - meta.height) / 2));
  const padBottom = Math.max(0, target - meta.height - padTop);
  const padLeft = Math.max(0, Math.floor((target - meta.width) / 2));
  const padRight = Math.max(0, target - meta.width - padLeft);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(fullBuf)
    .extend({
      top: padTop, bottom: padBottom, left: padLeft, right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`[icon]   ${outPath} (512x512, from live Unity WebGL demo)`);

  try { fs.unlinkSync(tmpFile); } catch {}
}

module.exports = { generateShareDemoIcon };

(async () => {
  const [demoUrl, outPath, waitStr] = process.argv.slice(2);
  if (!demoUrl || !outPath) {
    console.error('usage: node generate-share-demo-icon.js <demoUrl> <outPath> [waitMs]');
    process.exit(1);
  }
  const waitMs = parseInt(waitStr || '20000', 10);
  try {
    await generateShareDemoIcon(demoUrl, outPath, waitMs);
  } catch (err) {
    console.error('[err]', err);
    process.exit(1);
  }
})();
