#!/usr/bin/env node
/**
 * Generate 512x512 icon for a static Share* portfolio page.
 * These are not canvas games — they are info/landing pages. We render
 * the page in a 720x1280 mobile viewport and crop the visible hero area
 * (top 720x720 of the rendered page) so the screenshot captures the
 * page header/title — the most identifying part of a portfolio page.
 *
 * Usage:
 *   node generate-share-icon.js <sharePath> <outPath> [waitMs]
 *
 * Example:
 *   node generate-share-icon.js Share001_Ludo.html docs/assets/game-icons/Share001_Ludo.png 3000
 */

const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const http = require('http');

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

async function generateShareIcon(sharePath, outPath, waitMs = 3000) {
  const { server, baseUrl } = await startServer(DOCS_ROOT);
  console.log(`[server] ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 720, height: 1280 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const targetUrl = `${baseUrl}/${sharePath}`;
  console.log(`[open]   ${targetUrl}`);
  // networkidle can hang on Google Fonts (no network in some envs). Use domcontentloaded
  // then wait fixed time for fonts + JS to settle.
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(waitMs);
  // Try to wait for webfonts but don't fail if they hang
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
  await page.waitForTimeout(500);

  // Scroll to top so we capture the hero/title area
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Hide any cookie banners / nav overlays that might cover the hero
  await page.evaluate(() => {
    const sels = [
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="banner"]', '[class*="overlay"]',
      'div[style*="z-index: 9999"]', 'div[style*="z-index:9999"]',
    ];
    document.querySelectorAll(sels.join(',')).forEach((el) => {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });
  });
  await page.waitForTimeout(300);

  const fullBuf = await page.screenshot({ fullPage: false });
  const tmpFile = outPath + '.full.png';
  fs.writeFileSync(tmpFile, fullBuf);
  console.log(`[snap]   full viewport -> ${tmpFile}`);

  await browser.close();
  server.close();

  // Crop top 720x720 (hero area) from 720x1280 portrait, then resize to 512x512.
  // This keeps the page title and intro content — the recognizable part of a
  // portfolio page — instead of catching nav, cookie banner, or empty footer.
  const meta = await sharp(fullBuf).metadata();
  const side = meta.width;
  const top = 0;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(fullBuf)
    .extract({ left: 0, top, width: side, height: side })
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`[icon]   ${outPath} (512x512, top-square cropped from portfolio page)`);

  try { fs.unlinkSync(tmpFile); } catch {}
}

(async () => {
  const [sharePath, outPath, waitStr] = process.argv.slice(2);
  if (!sharePath || !outPath) {
    console.error('usage: node generate-share-icon.js <sharePath> <outPath> [waitMs]');
    process.exit(1);
  }
  const waitMs = parseInt(waitStr || '3000', 10);
  try {
    await generateShareIcon(sharePath, outPath, waitMs);
  } catch (err) {
    console.error('[err]', err);
    process.exit(1);
  }
})();
