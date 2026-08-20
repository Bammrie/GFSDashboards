export const MOB_PRODUCTION_MONTH = '2026-07';
export const MOB_PRODUCTION_SOURCE_UPDATED_AT = '2026-08-04T00:00:00.000Z';

// July 2026 monthly outstanding balance production. Credit insurance and
// debt protection are combined by credit union, including Auto PD as MOB.
export const MOB_PRODUCTION_SEEDS = Object.freeze([
  Object.freeze({ key: 'mct', accountName: 'MCT Credit Union', mobPremiumCollected: 54483.84 }),
  Object.freeze({ key: 'coastal-community', accountName: 'Coastal Community FCU', mobPremiumCollected: 18722.70 }),
  Object.freeze({ key: 'commoncents', accountName: 'CommonCents FCU', mobPremiumCollected: 10726.12 }),
  Object.freeze({ key: 'beaumont-community', accountName: 'Beaumont Community CU', mobPremiumCollected: 4718.33 }),
  Object.freeze({ key: 'connects', accountName: 'Connects FCU', mobPremiumCollected: 4132.35 }),
  Object.freeze({ key: 'bayou-community', accountName: 'Bayou Community FCU', mobPremiumCollected: 3841.62 }),
  Object.freeze({ key: 'victoria-teachers', accountName: 'Victoria Teachers FCU', mobPremiumCollected: 2516.76 }),
  Object.freeze({ key: 'jackson-county', accountName: 'Jackson County FCU', mobPremiumCollected: 2406.38 }),
  Object.freeze({ key: 'ufcw-local-23', accountName: 'UFCW Local 23 FCU', mobPremiumCollected: 2232.75 }),
  Object.freeze({ key: 'matagorda-county', accountName: 'Matagorda County CU', mobPremiumCollected: 2157.91 }),
  Object.freeze({ key: 'jct', accountName: 'JCT Federal CU', mobPremiumCollected: 1404.40 }),
  Object.freeze({ key: 'old-ocean', accountName: 'Old Ocean FCU', mobPremiumCollected: 1117.92 }),
  Object.freeze({ key: 'brazos-valley-schools', accountName: 'Brazos Valley Schools CU', mobPremiumCollected: 0.00 }),
  Object.freeze({ key: 'nspire', accountName: 'NSPIRE FCU', mobPremiumCollected: 0.00 })
]);

export const MOB_PRODUCTION_TOTAL = Math.round(
  MOB_PRODUCTION_SEEDS.reduce((total, seed) => total + seed.mobPremiumCollected, 0) * 100
) / 100;

const mobProductionSeedsByKey = new Map(MOB_PRODUCTION_SEEDS.map((seed) => [seed.key, seed]));

export function normalizeMobAccountName(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\b(FEDERAL|FED|CREDIT|UNION|CU|FCU|INC|THE)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mobProductionSeedKeyForName(value) {
  const name = normalizeMobAccountName(value);
  if (!name) return '';

  if (/\bMCT\b/.test(name) || name.includes('MEMBERS CHOICE OF TEXAS')) return 'mct';
  if (name.includes('COASTAL COMMUNITY')) return 'coastal-community';
  if (name.includes('COMMONCENTS') || name.includes('COMMON CENTS')) return 'commoncents';
  if (name.includes('BEAUMONT COMMUNITY')) return 'beaumont-community';
  if (name.includes('CONNECTS')) return 'connects';
  if (name.includes('BAYOU COMMUNITY')) return 'bayou-community';
  if (name.includes('VICTORIA TEACHERS')) return 'victoria-teachers';
  if (name.includes('JACKSON COUNTY TEACHERS') || name.includes('JACKSON COUNTY TFCU')) return '';
  if (name.includes('JACKSON COUNTY')) return 'jackson-county';
  if (name.includes('UFCW') || name.includes('LOCAL 23')) return 'ufcw-local-23';
  if (name.includes('MATAGORDA COUNTY')) return 'matagorda-county';
  if (/\bJCT\b/.test(name)) return 'jct';
  if (name.includes('OLD OCEAN')) return 'old-ocean';
  if (name.includes('BRAZOS VALLEY SCHOOLS')) return 'brazos-valley-schools';
  if (name.includes('NSPIRE')) return 'nspire';
  return '';
}

export function mobProductionSeedForName(value) {
  const key = mobProductionSeedKeyForName(value);
  const seed = key ? mobProductionSeedsByKey.get(key) : null;
  if (!seed) return null;
  return {
    ...seed,
    month: MOB_PRODUCTION_MONTH,
    updatedAt: MOB_PRODUCTION_SOURCE_UPDATED_AT
  };
}
