(() => {
  const TOOLTIP_SCRIPT_ID = 'paxdei-tooltip-embed';
  const TOOLTIP_SRC = 'https://paxdei.gaming.tools/embed.js';

  window.gtTooltipConfig = {
    scale: 0.8,
    delay: 50,
    ...(window.gtTooltipConfig || {})
  };

  if (!document.getElementById(TOOLTIP_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = TOOLTIP_SCRIPT_ID;
    script.async = true;
    script.src = TOOLTIP_SRC;
    document.head.append(script);
  }
})();
