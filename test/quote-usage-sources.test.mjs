import test from 'node:test';
import assert from 'node:assert/strict';
import { visitAttribution } from '../quote-usage-sources.mjs';
const req = (url = '/', headers = {}) => ({ originalUrl: url, get: key => headers[key], socket: { remoteAddress: '127.0.0.1' } });
test('attribution allows only tags and referral hostname; no full URLs, IPs or loan data', async () => {
  const data = await visitAttribution(req('/?utm_source=mailer&utm_medium=qr&utm_campaign=fall&cu=4u&loan=secret', {
    referer: 'https://example.com/member?secret=hidden', 'x-forwarded-for': '8.8.8.8, 10.0.0.1'
  }), async ip => { assert.equal(ip, '8.8.8.8'); return { city: 'Example', region: 'TX', country: 'US', ll: [1,2] }; }, true);
  assert.deepEqual(data, { source: 'mailer', medium: 'qr', campaign: 'fall', creditUnion: '4u', referrer: 'example.com', country: 'US', region: 'TX', city: 'Example' });
  assert.doesNotMatch(JSON.stringify(data), /secret|hidden|8\.8\.8\.8/);
});
test('unknown referrals and failed geolocation remain honest unknowns', async () => {
  const data = await visitAttribution(req('/', { referer: 'javascript:alert(1)' }), async () => { throw Error('offline'); });
  assert.equal(data.source, 'Direct / unknown');
  assert.equal(data.city, '');
});
test('no forwarded-header trust outside Railway and repeated tags cannot break parsing', async () => {
  const data = await visitAttribution(req('/?utm_source=%3Cscript%3E&utm_source=other', {'x-forwarded-for': '8.8.8.8', referer: 'https://google.com/search?q=private'}), async ip => { assert.equal(ip, '127.0.0.1'); return null; }, false);
  assert.equal(data.source, 'script');
  assert.equal(data.referrer, 'google.com');
});
test('local GeoLite lookup works without network requests', async () => {
  const data = await visitAttribution(req('/', { 'x-forwarded-for': '8.8.8.8' }), undefined, true);
  assert.equal(data.country, 'US');
});
