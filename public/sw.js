// DNEX Ponto: retire the legacy anonymous background synchronizer.
// Existing IndexedDB events are deliberately preserved for authenticated recovery.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key === 'dnex-ponto-v2').map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
// No fetch, sync or message handler: never cache authenticated data or replay old events.
