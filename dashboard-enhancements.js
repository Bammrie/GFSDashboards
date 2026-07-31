(() => {
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
