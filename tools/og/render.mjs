// 공유 이미지용 3D 렌더: vite preview(4173) 띄운 뒤 node tools/og/render.mjs → /home/claude/og/*.png
// 그다음 python3 tools/og/compose.py public/og.png
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--ignore-gpu-blocklist','--no-proxy-server'] });
const p = await b.newPage(); await p.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
const wait = ms => new Promise(r => setTimeout(r, ms));
const shots = [
  { r: 'knee', stage: 1, view: [0.35, 0.1, 1], dist: 0.72 },
  { r: 'shoulder', preset: 'cuff' },
  { r: 'neck', stage: 1, view: [-0.8, 0.15, 0.55], dist: 0.85 },
  { r: 'lumbar', stage: 1, view: [-0.75, 0.15, -0.65], dist: 1.0 },
];
for (const s of shots) {
  await p.goto(`http://127.0.0.1:4173/#${s.r}`, { waitUntil: 'load' });
  await p.waitForFunction('window.__madi && window.__madi.ready', { timeout: 90000 });
  await wait(2500);
  await p.evaluate((s) => {
    const M = window.__madi;
    if (s.preset) M.applyPreset(M.REGIONS.find(r => r.id === s.r).presets.find(x => x.id === s.preset));
    M.state.ghost = false;
    if (s.preset) {} else { M.state.stage = s.stage; M.refresh(); M.lookFrom(s.view, s.dist); }
    M.refresh();
    for (const el of document.querySelectorAll('header, aside, footer, #info, #posturePanel, #creditBtn')) el.style.display = 'none';
    document.body.style.background = 'transparent';
  }, s);
  await wait(6000);
  await p.screenshot({ path: `/home/claude/og/${s.r}.png`, omitBackground: true });
}
await b.close();
