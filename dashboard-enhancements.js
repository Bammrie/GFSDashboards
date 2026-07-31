(() => {
  const leaflet = window.L;
  if (leaflet && !leaflet.__gfsVisibleCircleMarkers) {
    const originalCircleMarker = leaflet.circleMarker;
    leaflet.circleMarker = function enhancedCircleMarker(latlng, options = {}) {
      const selected = Number(options.radius) >= 8 || Number(options.weight) >= 3;
      return originalCircleMarker.call(this, latlng, {
        ...options,
        radius: selected ? Math.max(Number(options.radius) || 0, 16) : Math.max(Number(options.radius) || 0, 11),
        weight: selected ? Math.max(Number(options.weight) || 0, 5) : Math.max(Number(options.weight) || 0, 3),
        color: selected ? '#111827' : '#ffffff',
        opacity: 1,
        fillOpacity: 1
      });
    };
    leaflet.__gfsVisibleCircleMarkers = true;
  }

  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search') || params.get('charter');
  if (initialSearch) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = initialSearch;
  }
})();
