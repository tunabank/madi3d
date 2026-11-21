// Madi 3D 서비스 워커 — 한 번 받은 화면·모델을 저장해 두고 다음부터 바로 띄운다.
// 화면(HTML)·구조물 목록은 네트워크 우선, 나머지(JS·모델·아이콘)는 저장본을 먼저 주고 뒤에서 갱신.
const CACHE = 'madi3d-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  const isPage = req.mode === 'navigate';
  const isData = /\/models\/.*\.json$/.test(req.url); // 구조물 목록은 자주 고칠 수 있어 네트워크 우선

  if (isPage || isData) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('./')))
    );
    return;
  }

  // 저장본을 바로 주고, 뒤에서 새 파일을 받아 저장본을 갱신(모델이 바뀌면 다음 실행 때 반영)
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
