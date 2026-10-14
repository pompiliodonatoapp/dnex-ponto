// DNEX Ponto — Service Worker para offline-first
const CACHE_NAME = "dnex-ponto-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install: cache assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: strategy network-first com fallback para cache
self.addEventListener("fetch", (event) => {
  // Não interceptar requisições para API Supabase (devem sempre ir à rede)
  if (event.request.url.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || new Response("Offline", { status: 503 })))
  );
});

// Background sync para batidas offline
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-clock-events") {
    event.waitUntil(syncClockEvents());
  }
});

async function syncClockEvents() {
  // Ler batidas pendentes do IndexedDB e enviar para Supabase
  // Implementação completa será adicionada quando o módulo de storage offline estiver pronto
  console.log("[SW] Syncing clock events...");
}