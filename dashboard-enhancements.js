(() => {
  const verifiedCoordinateOverrides = new Map([
    ['13', {
      name: 'EFCU Financial',
      latitude: 30.4083341,
      longitude: -91.0611501,
      address: '10719 Airline Hwy, Baton Rouge, LA 70816'
    }],
    ['7532', {
      name: 'Tuscaloosa VA Federal Credit Union',
      latitude: 33.18994,
      longitude: -87.48832,
      address: '3701 Loop Road East, Tuscaloosa, AL 35404'
    }]
  ]);

  function normalizeCharter(value) {
    return String(value ?? '').trim().replace(/\.0$/, '').replace(/^0+(?=\d)/, '');
  }

  function normalizeName(value) {
    return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function coordinateOverrideFor(creditUnion) {
    const charter = normalizeCharter(creditUnion?.charterNumber);
    if (verifiedCoordinateOverrides.has(charter)) return verifiedCoordinateOverrides.get(charter);

    const name = normalizeName(creditUnion?.name);
    if (name.includes('EFCU FINANCIAL')) return verifiedCoordinateOverrides.get('13');
    if (name.includes('TUSCALOOSA VA FEDERAL CREDIT UNION') || name.includes('TUSCALOOSA V A FEDERAL CREDIT UNION')) {
      return verifiedCoordinateOverrides.get('7532');
    }

    return null;
  }

  function applyVerifiedCoordinates(payload) {
    if (!payload || !Array.isArray(payload.creditUnions)) return { payload, applied: 0 };

    let applied = 0;
    const creditUnions = payload.creditUnions.map((creditUnion) => {
      const override = coordinateOverrideFor(creditUnion);
      if (!override) return creditUnion;

      applied += 1;
      return {
        ...creditUnion,
        latitude: override.latitude,
        longitude: override.longitude,
        geocodeMatchType: 'verified-client-location',
        geocodedAddress: override.address,
        coordinateOverride: true
      };
    });

    return {
      payload: {
        ...payload,
        creditUnions,
        verifiedCoordinateOverrideCount: applied
      },
      applied
    };
  }

  if (!window.__gfsVerifiedCoordinateFetchInstalled) {
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async function gfsVerifiedCoordinateFetch(input, init) {
      const response = await nativeFetch(input, init);
      const rawUrl = typeof input === 'string' ? input : input?.url;
      const method = String(init?.method || input?.method || 'GET').toUpperCase();

      let requestUrl = null;
      try {
        requestUrl = new URL(rawUrl, window.location.href);
      } catch {
        return response;
      }

      if (method !== 'GET' || requestUrl.pathname !== '/api/ncua-credit-unions' || !response.ok) {
        return response;
      }

      try {
        const body = await response.clone().json();
        const patched = applyVerifiedCoordinates(body);
        if (!patched.applied) return response;

        const headers = new Headers(response.headers);
        headers.delete('content-length');
        headers.delete('content-encoding');
        headers.set('content-type', 'application/json; charset=utf-8');
        headers.set('x-gfs-coordinate-overrides', String(patched.applied));

        return new Response(JSON.stringify(patched.payload), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        console.warn('Unable to apply verified GFS map coordinates.', error);
        return response;
      }
    };

    window.__gfsVerifiedCoordinateFetchInstalled = true;
  }

  const leaflet = window.L;
  if (leaflet && !leaflet.__gfsHtmlMapMarkers) {
    const originalCircleMarker = leaflet.circleMarker.bind(leaflet);

    leaflet.circleMarker = function visibleHtmlMarker(latlng, options = {}) {
      if (!leaflet.divIcon || !leaflet.marker) {
        return originalCircleMarker(latlng, options);
      }

      const selected = Number(options.radius) >= 8 || Number(options.weight) >= 3;
      const fillColor = String(options.fillColor || options.color || '#7a1e2c');
      const normalizedColor = fillColor.toLowerCase();
      const isClient = normalizedColor === '#7a1e2c' || normalizedColor === 'rgb(122, 30, 44)';
      const label = isClient ? 'C' : 'P';
      const size = selected ? 48 : 36;
      const borderWidth = selected ? 5 : 4;
      const fontSize = selected ? 18 : 14;
      const outerRing = selected ? '#111827' : 'rgba(17, 24, 39, .9)';

      const icon = leaflet.divIcon({
        className: 'gfs-map-marker-shell',
        html: `<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${size}px;height:${size}px;border-radius:999px;background:${fillColor};border:${borderWidth}px solid #fff;box-shadow:0 0 0 ${selected ? 4 : 3}px ${outerRing},0 5px 16px rgba(0,0,0,.85);color:#fff;font:900 ${fontSize}px/1 Arial,sans-serif;letter-spacing:0;text-shadow:0 1px 3px rgba(0,0,0,.95);transform:translateZ(0);">${label}</span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2)]
      });

      return leaflet.marker(latlng, {
        icon,
        keyboard: true,
        interactive: options.interactive !== false,
        bubblingMouseEvents: options.bubblingMouseEvents !== false,
        riseOnHover: true,
        riseOffset: 1000,
        zIndexOffset: selected ? 1000 : 0
      });
    };

    leaflet.__gfsHtmlMapMarkers = true;
    leaflet.__gfsVisibleCircleMarkers = true;
  }

  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search') || params.get('charter');
  if (initialSearch) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = initialSearch;
  }
})();