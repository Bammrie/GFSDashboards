const DEFAULT_PROJECTION_YEARS = 5;
const MIN_ANNUAL_RATE = -0.2;
const MAX_ANNUAL_RATE = 0.35;
const METRICS = ['assets', 'members', 'loans'];

const finiteNumber = (value) => (Number.isFinite(value) ? value : null);
const positiveNumber = (value) => (Number.isFinite(value) && value > 0 ? value : null);

function cycleParts(cycle) {
  const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: match[2] };
}

function percentChange(current, previous) {
  const currentValue = finiteNumber(current);
  const previousValue = finiteNumber(previous);
  if (currentValue == null || previousValue == null || previousValue === 0) return null;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

function confidenceLabel(rSquared, sampleCount) {
  if (!Number.isFinite(rSquared) || sampleCount < 3) return 'Unavailable';
  if (sampleCount >= 5 && rSquared >= 0.8) return 'High';
  if (sampleCount >= 4 && rSquared >= 0.5) return 'Medium';
  return 'Low';
}

function fitLogLinearTrend(history, metric) {
  const points = history
    .map((row) => {
      const parts = cycleParts(row?.cycle);
      const value = positiveNumber(row?.[metric]);
      return parts && value != null ? { x: parts.year, y: Math.log(value) } : null;
    })
    .filter(Boolean);

  if (points.length < 3) {
    return { annualRatePct: null, rSquared: null, confidence: 'Unavailable', sampleCount: points.length };
  }

  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + ((point.x - meanX) ** 2), 0);
  if (!denominator) {
    return { annualRatePct: null, rSquared: null, confidence: 'Unavailable', sampleCount: points.length };
  }

  const slope = points.reduce(
    (sum, point) => sum + ((point.x - meanX) * (point.y - meanY)),
    0
  ) / denominator;
  const intercept = meanY - (slope * meanX);
  const totalVariance = points.reduce((sum, point) => sum + ((point.y - meanY) ** 2), 0);
  const residualVariance = points.reduce((sum, point) => {
    const fitted = intercept + (slope * point.x);
    return sum + ((point.y - fitted) ** 2);
  }, 0);
  const rSquared = totalVariance > 0 ? Math.max(0, Math.min(1, 1 - (residualVariance / totalVariance))) : 1;
  const boundedSlope = Math.max(Math.log1p(MIN_ANNUAL_RATE), Math.min(Math.log1p(MAX_ANNUAL_RATE), slope));
  const annualRatePct = Math.expm1(boundedSlope) * 100;

  return {
    annualRatePct,
    rSquared,
    confidence: confidenceLabel(rSquared, points.length),
    sampleCount: points.length
  };
}

function classifyTrend(growth) {
  const assetGrowth = growth.assets?.fiveYearPct;
  const memberGrowth = growth.members?.fiveYearPct;
  if (!Number.isFinite(assetGrowth) || !Number.isFinite(memberGrowth)) return 'Insufficient history';
  if (Math.abs(assetGrowth) < 1 && Math.abs(memberGrowth) < 1) return 'Stable';
  if (assetGrowth > 0 && memberGrowth > 0) return 'Growing';
  if (assetGrowth < 0 && memberGrowth < 0) return 'Declining';
  return 'Mixed';
}

export function buildGrowthProjection(history, { projectionYears = DEFAULT_PROJECTION_YEARS } = {}) {
  const orderedHistory = [...(Array.isArray(history) ? history : [])]
    .filter((row) => cycleParts(row?.cycle))
    .sort((a, b) => String(a.cycle).localeCompare(String(b.cycle)));
  const latest = orderedHistory.at(-1) || null;
  const previous = orderedHistory.at(-2) || null;
  const oldest = orderedHistory[0] || null;
  const latestCycle = cycleParts(latest?.cycle);

  const growth = {};
  const models = {};
  for (const metric of METRICS) {
    const model = fitLogLinearTrend(orderedHistory, metric);
    models[metric] = model;
    growth[metric] = {
      oneYearPct: percentChange(latest?.[metric], previous?.[metric]),
      fiveYearPct: percentChange(latest?.[metric], oldest?.[metric]),
      annualTrendPct: model.annualRatePct,
      rSquared: model.rSquared,
      confidence: model.confidence,
      sampleCount: model.sampleCount
    };
  }

  const projection = [];
  if (latest && latestCycle) {
    for (let offset = 1; offset <= projectionYears; offset += 1) {
      const projected = { cycle: `${latestCycle.year + offset}-${latestCycle.month}` };
      for (const metric of METRICS) {
        const currentValue = positiveNumber(latest[metric]);
        const annualRatePct = models[metric].annualRatePct;
        projected[metric] = currentValue != null && Number.isFinite(annualRatePct)
          ? Math.round(currentValue * ((1 + (annualRatePct / 100)) ** offset))
          : null;
      }
      projection.push(projected);
    }
  }

  const projectedFiveYear = projection.at(-1) || { assets: null, members: null, loans: null };
  return {
    growth,
    trend: classifyTrend(growth),
    projection,
    projectedFiveYear: {
      assets: finiteNumber(projectedFiveYear.assets),
      members: finiteNumber(projectedFiveYear.members),
      loans: finiteNumber(projectedFiveYear.loans)
    }
  };
}

export const projectionMethod = {
  name: 'Same-quarter log-linear trend',
  description: 'Uses up to six same-quarter NCUA observations covering the latest five-year span. Annual trend rates are capped between -20% and +35% before projecting five years forward.',
  minimumAnnualRatePct: MIN_ANNUAL_RATE * 100,
  maximumAnnualRatePct: MAX_ANNUAL_RATE * 100,
  projectionYears: DEFAULT_PROJECTION_YEARS
};
