import { isIP } from 'node:net';

// Load local GeoLite data lazily. No IP is stored or sent to a third party.
let geoModule;
const localLookup = async (ip) => {
  geoModule ||= import('geoip-lite').catch(() => null);
  const module = await geoModule;
  return module?.default.lookup(ip) || null;
};
const label = (value) => typeof value === 'string'
  ? value.replace(/[^a-zA-Z0-9 ._()-]/g, '').trim().slice(0, 80) : '';

export async function visitAttribution(req, lookup = localLookup, railway = Boolean(process.env.RAILWAY_ENVIRONMENT_ID)) {
  const url = new URL(req.originalUrl || req.url || '/', 'https://dashboard.goodwinefinancialservices.com');
  let referrer = '';
  try {
    const ref = new URL(req.get('referer') || '');
    if (['http:', 'https:'].includes(ref.protocol)) referrer = ref.hostname.slice(0, 253);
  } catch { /* Missing and suppressed referrers stay unknown. */ }
  const source = label(url.searchParams.get('utm_source')) || referrer || 'Direct / unknown';
  // Railway terminates public requests at its edge; only use its forwarded
  // address on Railway. This approximate lookup is never used for security.
  const address = railway ? (req.get('x-forwarded-for') || '').split(',')[0].trim() : req.socket?.remoteAddress;
  let geo = null;
  try { if (address && isIP(address)) geo = await lookup(address); } catch { /* Counts must survive lookup failures. */ }
  return {
    source, referrer,
    medium: label(url.searchParams.get('utm_medium')),
    campaign: label(url.searchParams.get('utm_campaign')),
    creditUnion: label(url.searchParams.get('cu')),
    country: label(geo?.country), region: label(geo?.region), city: label(geo?.city)
  };
}
