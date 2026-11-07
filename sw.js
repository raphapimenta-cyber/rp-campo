// Service worker of the iPhone build: keeps the app (index.html, manifest and icons) on the phone so it opens without
// internet. Cache first; a new version is published by changing CACHE (build-ios.ps1 writes it), downloaded in the
// background and used the next time the app is opened. Requests to other sites (Google sync) are not touched.
const CACHE = 'rp-campo-v25-ios1-18b89ddc3314';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icones/icon-192.png', './icones/icon-512.png', './icones/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; })))
    .catch(err => { if (r.mode === 'navigate') return caches.match('./index.html'); throw err; })); // only opening the app falls back to it
});
