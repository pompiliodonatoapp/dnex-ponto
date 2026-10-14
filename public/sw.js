// DNEX Ponto — Service Worker v2: offline-first com IndexedDB sync
const CACHE_NAME = "dnex-ponto-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install: cache static assets + skip waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches + claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Supabase API: network-first with cache fallback for GET
  if (url.hostname.includes("supabase.co")) {
    if (event.request.method === "GET") {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    }
    // POST/PUT/DELETE: pass through, don't cache
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.destination === "document") {
        return caches.match("/index.html");
      }
      return new Response("Offline", { status: 503 });
    })
  );
});

// Background Sync: sync offline clock events when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-clock-events") {
    event.waitUntil(syncClockEvents());
  }
});

// Periodic sync for retrying failed syncs
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "retry-clock-sync") {
    event.waitUntil(syncClockEvents());
  }
});

async function syncClockEvents() {
  try {
    const db = await openIDB();
    const events = await getAllPending(db);

    if (events.length === 0) return;

    const supabaseUrl = "https://fxhphmuymkltukkkieky.supabase.co";
    // Read anon key from cache or use env-injected value
    const anonKey = await getAnonKey();

    if (!anonKey) {
      console.warn("[SW] No anon key available, skipping sync");
      return;
    }

    let synced = 0;
    for (const event of events) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/time_clock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            account_id: event.account_id,
            employee_id: event.employee_id,
            timestamp_utc: event.timestamp_utc,
            type: event.type,
            source: event.source,
            latitude: event.latitude,
            longitude: event.longitude,
            is_offline_sync: true,
            original_timestamp_utc: event.original_timestamp_utc,
            device_info: event.device_info,
          }),
        });

        if (response.ok || response.status === 409) {
          // Success or duplicate: remove from queue
          await removeEvent(db, event.id);
          synced++;
        } else {
          console.warn(`[SW] Failed to sync event ${event.id}: ${response.status}`);
        }
      } catch (err) {
        console.error(`[SW] Network error syncing event ${event.id}:`, err);
        // Stop on network error, will retry on next sync
        break;
      }
    }

    console.log(`[SW] Synced ${synced}/${events.length} offline events`);

    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: "sync-complete", synced, total: events.length });
    }
  } catch (err) {
    console.error("[SW] Sync failed:", err);
  }
}

// --- IndexedDB helpers (duplicated in SW context since SW can't import modules) ---
const DB_NAME = "dnex-ponto-offline";
const DB_VERSION = 1;
const STORE_NAME = "clock-events";
const META_STORE = "meta";

function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

function removeEvent(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAnonKey() {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const req = store.get("anon_key");
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Listen for messages from main thread (e.g., store anon key)
self.addEventListener("message", (event) => {
  if (event.data?.type === "store-anon-key") {
    openIDB().then((db) => {
      const tx = db.transaction(META_STORE, "readwrite");
      tx.objectStore(META_STORE).put(event.data.key, "anon_key");
      tx.oncomplete = () => console.log("[SW] Anon key stored");
    });
  }
  if (event.data?.type === "trigger-sync") {
    syncClockEvents();
  }
});