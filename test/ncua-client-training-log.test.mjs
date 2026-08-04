import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInstitutionIdentityIndex,
  combineLegacyTrainingEntry,
  institutionIdentityKeys,
  resolveInstitutionCharter
} from '../cu-loan-advisor/ncua-client-training-log-hook.mjs';

test('combines all three legacy training boxes into one labeled update', () => {
  assert.equal(
    combineLegacyTrainingEntry({
      report: 'Reviewed the new GAP presentation.',
      changed: 'Loan officers now introduce GAP before quoting payment.',
      needsWork: 'Return next month to coach two new hires.'
    }),
    [
      'Encounter report',
      'Reviewed the new GAP presentation.',
      '',
      'What changed',
      'Loan officers now introduce GAP before quoting payment.',
      '',
      'Needs work / follow-up',
      'Return next month to coach two new hires.'
    ].join('\n')
  );
});

test('preserves the available legacy boxes when older data is incomplete', () => {
  assert.equal(
    combineLegacyTrainingEntry({ report: 'Completed refresher training.', needsWork: 'Send job aid.' }),
    'Encounter report\nCompleted refresher training.\n\nNeeds work / follow-up\nSend job aid.'
  );
});

test('does not discard an older entry just because one of the three boxes is absent', () => {
  assert.equal(
    combineLegacyTrainingEntry({ changed: 'The branch adopted the new process.' }),
    'What changed\nThe branch adopted the new process.'
  );
});

test('matches FCU abbreviations to the NCUA institution name', () => {
  const index = buildInstitutionIdentityIndex([
    { charterNumber: '12345', name: 'Tuscaloosa VA Federal Credit Union' }
  ]);

  assert.equal(resolveInstitutionCharter('Tuscaloosa VA FCU', index), '12345');
  assert.ok(institutionIdentityKeys('Tuscaloosa VA FCU').includes('tuscaloosa va'));
});

test('uses the current Client classification to disambiguate duplicate institution names', () => {
  const index = buildInstitutionIdentityIndex([
    { charterNumber: '100', name: 'First Community Credit Union' },
    { charterNumber: '200', name: 'First Community Credit Union' }
  ]);

  assert.equal(resolveInstitutionCharter('First Community CU', index, new Set(['200'])), '200');
  assert.equal(resolveInstitutionCharter('First Community CU', index), '');
});
