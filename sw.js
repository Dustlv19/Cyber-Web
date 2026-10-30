// Service worker: l'app si apre anche senza connessione.
const CACHE = 'cyber-web-v10';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

// Tocco su una notifica: riporta l'app in primo piano (e apre la chat AI se la notifica era dell'AI).
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const ai = e.notification.tag === 'ai';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    if (list.length) { list[0].focus(); if (ai) list[0].postMessage({ type: 'open-ai' }); return; }
    return clients.openWindow(ai ? './?ai=1' : './');
  }));
});
