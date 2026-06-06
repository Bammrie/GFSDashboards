import { CSO_LIMITS } from '../data/csoLimits.js';
import { CSO_RATE_CONFIG } from '../data/csoRates.js';

export const SETTINGS_STORAGE_KEY = 'premiumQuoteProCsoSettings';
export const LAST_STATE_STORAGE_KEY = 'premiumQuoteProLastState';

export const DEFAULT_USER_SETTINGS = {
  authorizedStates: ['MO', 'AR'],
  defaultStateMode: 'last',
  defaultState: 'MO',
  calculationMethod: 'gross',
  enabledDisabilityWaitingPeriods: ['sevenDayRetro'],
  rateConfig: CSO_RATE_CONFIG,
  limits: CSO_LIMITS,
  rateEditMode: false
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Unable to read ${key}.`, error);
    return null;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to save ${key}.`, error);
  }
}

export function loadUserSettings() {
  const stored = readJson(SETTINGS_STORAGE_KEY);
  return {
    ...clone(DEFAULT_USER_SETTINGS),
    ...(stored && typeof stored === 'object' ? stored : {}),
    rateConfig: {
      ...clone(CSO_RATE_CONFIG),
      ...(stored?.rateConfig || {})
    },
    limits: {
      ...clone(CSO_LIMITS),
      ...(stored?.limits || {})
    }
  };
}

export function saveUserSettings(settings) {
  writeJson(SETTINGS_STORAGE_KEY, settings);
}

export function restoreDefaultSettings() {
  const defaults = clone(DEFAULT_USER_SETTINGS);
  saveUserSettings(defaults);
  return defaults;
}

export function loadLastSelectedState() {
  try {
    return window.localStorage.getItem(LAST_STATE_STORAGE_KEY) || '';
  } catch (error) {
    return '';
  }
}

export function saveLastSelectedState(state) {
  try {
    window.localStorage.setItem(LAST_STATE_STORAGE_KEY, state);
  } catch (error) {
    console.warn('Unable to save last selected state.', error);
  }
}

export function resolveDefaultState(settings) {
  const authorized = settings.authorizedStates?.length ? settings.authorizedStates : ['MO'];
  if (authorized.length === 1) return authorized[0];
  if (settings.defaultStateMode === 'MO' && authorized.includes('MO')) return 'MO';
  if (settings.defaultStateMode === 'AR' && authorized.includes('AR')) return 'AR';
  const lastState = loadLastSelectedState();
  return authorized.includes(lastState) ? lastState : authorized[0];
}
