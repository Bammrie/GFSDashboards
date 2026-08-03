const CACHE_KEY = 'gfs-client-dashboard-api-cache-v1';
const nativeFetch = window.fetch.bind(window);

function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.creditUnions) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...payload,
      clientSnapshotCachedAt: new Date().toISOString()
    }));
  } catch {
    // Storage may be unavailable; the live request still succeeds.
  }
}

const cachedPayload = readCache();
let usedCachedResponse = false;

window.fetch = async function cachedClientFetch(input, init) {
  const url = typeof input === 'string' ? input : input?.url;
  const method = String(init?.method || input?.method || 'GET').toUpperCase();

  if (url === '/api/ncua-credit-unions' && method === 'GET' && cachedPayload && !usedCachedResponse) {
    usedCachedResponse = true;
    queueMicrotask(async () => {
      try {
        const response = await nativeFetch(input, init);
        if (!response.ok) return;
        const payload = await response.clone().json();
        writeCache(payload);
        window.dispatchEvent(new CustomEvent('gfs-client-data-refreshed', { detail: payload }));
      } catch {
        // Keep displaying the latest successful snapshot.
      }
    });

    return new Response(JSON.stringify(cachedPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-GFS-Client-Snapshot': 'cached'
      }
    });
  }

  const response = await nativeFetch(input, init);
  if (url === '/api/ncua-credit-unions' && method === 'GET' && response.ok) {
    response.clone().json().then(writeCache).catch(() => {});
  }
  return response;
};

if (!document.querySelector('script[data-client-products-loader]')) {
  const clientProductsScript = document.createElement('script');
  clientProductsScript.type = 'module';
  clientProductsScript.src = 'clients-products.js?v=20260803-client-product-checklist';
  clientProductsScript.dataset.clientProductsLoader = 'true';
  document.head.appendChild(clientProductsScript);
}
