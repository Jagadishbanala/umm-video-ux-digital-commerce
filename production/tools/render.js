// Usage: node render.js <rootDir> <outDir> <mode: stills|frames> [t1,t2,...]
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const [,, ROOT, OUT, MODE = 'stills', LIST = ''] = process.argv;
const MIME = { '.html': 'text/html', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(path.resolve(ROOT)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const size = fs.statSync(p).size, type = MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const [s, e] = range.replace('bytes=', '').split('-');
    const start = parseInt(s, 10), end = e ? parseInt(e, 10) : size - 1;
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': type });
    fs.createReadStream(p, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': size, 'Content-Type': type, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(p).pipe(res);
  }
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--force-color-profile=srgb', '--mute-audio'],
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/comp/index.html?render=1`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => window.__ready);
  const SZ = await page.evaluate(() => window.__size || {w:1920,h:1080});
  await page.setViewport({ width: SZ.w, height: SZ.h, deviceScaleFactor: 1 });
  await page.evaluate(() => window.__seek(0));
  fs.mkdirSync(OUT, { recursive: true });
  let F0 = 0, F1 = Math.round(parseFloat(LIST || '6') * 30); if (MODE === 'range') { const [a, b] = LIST.split(':').map(Number); F0 = a; F1 = b; }
  const times = MODE === 'stills' ? LIST.split(',').map(Number) : Array.from({ length: F1 - F0 + 1 }, (_, i) => (F0 + i) / 30);
  let i = MODE === 'range' ? F0 : 0; const t0 = Date.now();
  for (const t of times) {
    await page.evaluate(tt => window.__seek(tt), t);
    const name = MODE === 'stills' ? `still_${t.toFixed(2)}.jpg` : `f_${String(i).padStart(4, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, name), type: MODE === 'stills' ? 'jpeg' : 'png', quality: MODE === 'stills' ? 85 : undefined, clip: { x: 0, y: 0, width: SZ.w, height: SZ.h } });
    i++;
  }
  console.log(`captured ${i} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
