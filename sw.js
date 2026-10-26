const CACHE_NAME = "trading-sport-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // درخواست‌ها فعلاً از شبکه پاسخ می‌گیرند.
  // این نسخه عمداً پاسخ‌های قدیمی قیمت‌ها را ذخیره نمی‌کند.
});
