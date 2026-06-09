#!/usr/bin/env node
/**
 * Generate square icon (512x512) for a game by:
 *   1. Loading the game in headless Chromium
 *   2. Waiting for the canvas / game to be ready
 *   3. Taking a full-page screenshot
 *   4. Cropping the center to a square and resizing to 512x512
 *
 * Usage:
 *   node generate-icon.js <playPath> <outPath> [waitMs]
 *
 * Example:
 *   node generate-icon.js hubgames/000001_10_Ten/index.html docs/assets/game-icons/000001_10_Ten.png 6000
 */

const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'docs');

function startServer(rootDir, port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqUrl = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(rootDir, reqUrl);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        return res.end('forbidden');
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('not found: ' + reqUrl);
        }
        const ext = path.extname(filePath).toLowerCase();
        const types = {
          '.html': 'text/html', '.js': 'application/javascript',
          '.css': 'text/css', '.json': 'application/json',
          '.png': 'image/png', '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
          '.mjs': 'application/javascript', '.map': 'application/json',
        };
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(data);
      });
    });
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

async function generateIcon(playPath, outPath, waitMs = 6000) {
  if (!fs.existsSync(DOCS_ROOT)) {
    throw new Error('docs/ not found: ' + DOCS_ROOT);
  }
  const { server, baseUrl } = await startServer(DOCS_ROOT);
  console.log(`[server] ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  // Portrait mobile viewport — most of these Construct 3 games target 9:16, this
  // makes the game canvas fill the full screen so nothing is clipped.
  const context = await browser.newContext({
    viewport: { width: 720, height: 1280 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const targetUrl = `${baseUrl}/${playPath}`;
  console.log(`[open]   ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // wait for canvas / game to render
  try {
    await page.waitForSelector('canvas', { timeout: 8000 });
  } catch (e) {
    console.log('[wait]   no <canvas> found, fallback to dom-timeout');
  }
  await page.waitForTimeout(waitMs);

  // Try multiple ways to skip the main menu / splash so the screenshot shows gameplay
  // 1. Click DOM "play / start / continue" buttons
  // 2. Click the center of the largest canvas (many Construct 3 games start on tap)
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const playText = /^(play|start|start\s*game|play\s*now|tap\s*to\s*start|continue|get\s*started|new\s*game|bắt\s*đầu|chơi|tiếp\s*tục|▶)$/i;
      document.querySelectorAll('button, a, div, span').forEach((el) => {
        const t = (el.innerText || el.textContent || '').trim();
        if (t && playText.test(t) && el.offsetWidth > 0 && el.offsetHeight > 0) {
          try { el.click(); } catch {}
        }
      });
    });
    await page.mouse.click(512, 512);
    await page.waitForTimeout(1500);
  }

  // hide obvious splash/loading overlays so we capture gameplay, not loading screens
  await page.evaluate(() => {
    const selectors = [
      'div[style*="z-index"][style*="999"]',
      '.splash', '.loading', '#splash', '#loading', '.preloader',
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (el.querySelector('img, video, canvas')) return;
      el.style.opacity = '0';
    });
  });
  await page.waitForTimeout(500);

  const fullBuf = await page.screenshot({ fullPage: false });
  const tmpFile = outPath + '.full.png';
  fs.writeFileSync(tmpFile, fullBuf);
  console.log(`[snap]   full viewport -> ${tmpFile}`);

  await browser.close();
  server.close();

  // Crop center square from the 720x1280 portrait screenshot — keeps the entire
  // game canvas in view, drops only empty space at top/bottom (no content lost).
  // Resize that square to 512x512.
  const meta = await sharp(fullBuf).metadata();
  const side = meta.width;                    // 720
  const top = Math.floor((meta.height - side) / 2);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(fullBuf)
    .extract({ left: 0, top, width: side, height: side })
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`[icon]   ${outPath} (512x512, square cropped from portrait, full game in view)`);

  try { fs.unlinkSync(tmpFile); } catch {}
}

(async () => {
  const [playPath, outPath, waitStr] = process.argv.slice(2);
  if (!playPath || !outPath) {
    console.error('usage: node generate-icon.js <playPath> <outPath> [waitMs]');
    process.exit(1);
  }
  const waitMs = parseInt(waitStr || '6000', 10);
  try {
    await generateIcon(playPath, outPath, waitMs);
  } catch (err) {
    console.error('[err]', err);
    process.exit(1);
  }
})();
