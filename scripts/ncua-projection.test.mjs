import assert from 'node:assert/strict';
import test from 'node:test';

import { buildGrowthProjection } from './ncua-projection.mjs';

function history(values) {
  return values.map((value, index) => ({
    cycle: `${2021 + index}-03`,
    assets: value,
    members: value,
    loans: value
  }));
}

test('projects a steady ten-percent trend for five years', () => {
  const values = [100, 110, 121, 133.1, 146.41, 161.051];
  const result = buildGrowthProjection(history(values));
  assert.equal(result.trend, 'Growing');
  assert.ok(Math.abs(result.growth.assets.annualTrendPct - 10) < 0.01);
  assert.ok(Math.abs(result.projectedFiveYear.assets - 259) <= 1);
  assert.equal(result.projection.length, 5);
});

test('classifies assets and members moving down together as declining', () => {
  const rows = [2021, 2022, 2023, 2024, 2025, 2026].map((year, index) => ({
    cycle: `${year}-03`,
    assets: 100 - (index * 5),
    members: 1000 - (index * 50),
    loans: 60 - (index * 2)
  }));
  const result = buildGrowthProjection(rows);
  assert.equal(result.trend, 'Declining');
  assert.ok(result.growth.assets.fiveYearPct < 0);
  assert.ok(result.projectedFiveYear.assets < rows.at(-1).assets);
});

test('caps an extreme annual trend at thirty-five percent', () => {
  const result = buildGrowthProjection(history([10, 25, 65, 170, 450, 1200]));
  assert.ok(Math.abs(result.growth.assets.annualTrendPct - 35) < 0.001);
});

test('does not project a metric with fewer than three valid observations', () => {
  const rows = [
    { cycle: '2021-03', assets: null, members: 10, loans: null },
    { cycle: '2022-03', assets: null, members: 11, loans: null },
    { cycle: '2023-03', assets: null, members: null, loans: null },
    { cycle: '2024-03', assets: null, members: null, loans: null },
    { cycle: '2025-03', assets: 100, members: null, loans: null },
    { cycle: '2026-03', assets: 110, members: null, loans: null }
  ];
  const result = buildGrowthProjection(rows);
  assert.equal(result.growth.assets.confidence, 'Unavailable');
  assert.equal(result.projectedFiveYear.assets, null);
  assert.equal(result.trend, 'Insufficient history');
});
