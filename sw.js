// Registro — service worker
// Strategia "network-first": prova sempre a scaricare la versione più
// recente della pagina; usa la cache solo come riserva se sei offline.
// Così un aggiornamento del file arriva sempre, senza dover mai
// cancellare e ricreare l'icona sulla Home.

const CACHE_VERSION = "registro-cache-v1";
const PRECACHE_FILES = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_FILES))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Tocca solo le richieste dello stesso sito (l'app stessa).
  // Firebase, i font e Chart.js restano intoccati, come da rete normale.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
