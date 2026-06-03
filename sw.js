// ══════════════════════════════════════════════════
//  THÁI ẤT THẦN KINH — Service Worker
//  Chiến lược:
//    - Static assets (fonts, app shell) → Cache First
//    - API calls (proxy, Claude) → Network Only (không cache AI responses)
//    - Offline fallback → serve cached index.html
// ══════════════════════════════════════════════════

const CACHE_NAME = 'thai-at-v1';
const CACHE_NAME_FONTS = 'thai-at-fonts-v1';

// Assets cần cache ngay khi install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// Domains chỉ dùng network (API, AI proxy)
const NETWORK_ONLY_PATTERNS = [
  'thuongvip.shadowthuong.workers.dev',
  'api.anthropic.com',
  'fonts.googleapis.com',      // fetch mới nhất, fallback cache
];

// ── INSTALL: precache app shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: xóa cache cũ ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_NAME_FONTS)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: routing logic ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API calls → Network Only, không cache
  const isApi = NETWORK_ONLY_PATTERNS.some(p => url.hostname.includes(p));
  if (isApi) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Google Fonts CSS → Network first, fallback cache
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME_FONTS).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // 3. App shell & static → Cache First, fallback network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Chỉ cache GET requests thành công
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback: trả về index.html cho navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
