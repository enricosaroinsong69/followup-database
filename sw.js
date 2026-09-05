/* Service worker Follow Up Pelanggan — menyimpan kerangka aplikasi supaya bisa dibuka tanpa internet. */
const CACHE = 'followup-v1';
const BERKAS = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Data dari Apps Script selalu diambil langsung, jangan pernah disimpan.
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(tersimpan => {
      const dariJaringan = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const salinan = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, salinan));
        }
        return res;
      }).catch(() => tersimpan);
      return tersimpan || dariJaringan;
    })
  );
});
