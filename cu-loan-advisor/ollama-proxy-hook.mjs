import express from 'express';

const CU_LOAN_ADVISOR_OLLAMA_URL = (process.env.CU_LOAN_ADVISOR_OLLAMA_URL || 'http://localhost:11434').replace(
  /\/+$/,
  ''
);
const CU_LOAN_ADVISOR_MODEL = 'llama3.1:8b';
const CU_LOAN_ADVISOR_TAGS_TIMEOUT_MS = 8_000;
const CU_LOAN_ADVISOR_GENERATE_TIMEOUT_MS = 90_000;
const CU_LOAN_ADVISOR_CORS_ORIGINS = new Set([
  'https://dashboard.goodwinefinancialservices.com',
  'http://dashboard.goodwinefinancialservices.com'
]);
const PROXY_INSTALLED = Symbol.for('gfs.cuLoanAdvisor.ollamaProxyInstalled');
const PROXY_INSTALLING = Symbol.for('gfs.cuLoanAdvisor.ollamaProxyInstalling');

function isAllowedCuLoanAdvisorOrigin(origin = '') {
  if (!origin) return false;
  if (CU_LOAN_ADVISOR_CORS_ORIGINS.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  } catch (error) {
    return false;
  }
}

async function fetchOllamaJson(endpoint, options = {}, timeoutMs = CU_LOAN_ADVISOR_TAGS_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${CU_LOAN_ADVISOR_OLLAMA_URL}/api/${endpoint.replace(/^\/+/, '')}`, {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    let payload = {};

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = { error: text };
      }
    }

    if (!response.ok) {
      throw new Error(payload.error || `Ollama returned HTTP ${response.status}.`);
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Ollama request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function serializeOllamaError(error) {
  return {
    ok: false,
    error: error?.message || 'Unable to reach local Ollama.'
  };
}

function installCuLoanAdvisorProxy(app) {
  app.use('/api/cu-loan-advisor/ollama', (req, res, next) => {
    const origin = req.get('origin') || '';
    if (isAllowedCuLoanAdvisorOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  app.get('/api/cu-loan-advisor/ollama/tags', async (_req, res) => {
    try {
      const payload = await fetchOllamaJson('tags', {}, CU_LOAN_ADVISOR_TAGS_TIMEOUT_MS);
      const models = Array.isArray(payload.models) ? payload.models : [];

      res.json({
        ok: true,
        preferredModel: CU_LOAN_ADVISOR_MODEL,
        preferredModelAvailable: models.some(
          (model) => model?.name === CU_LOAN_ADVISOR_MODEL || model?.model === CU_LOAN_ADVISOR_MODEL
        ),
        models
      });
    } catch (error) {
      console.error('CU Loan Advisor Ollama tags request failed.', error);
      res.status(502).json(serializeOllamaError(error));
    }
  });

  app.post('/api/cu-loan-advisor/ollama/generate', express.json({ limit: '1mb' }), async (req, res) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      const system = typeof req.body?.system === 'string' ? req.body.system.trim() : '';
      const options =
        req.body?.options && typeof req.body.options === 'object' && !Array.isArray(req.body.options)
          ? req.body.options
          : {};

      if (!prompt) {
        res.status(400).json({ ok: false, error: 'A prompt is required.' });
        return;
      }

      const payload = await fetchOllamaJson(
        'generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: CU_LOAN_ADVISOR_MODEL,
            prompt,
            system,
            stream: false,
            options: {
              temperature: 0.2,
              ...options
            }
          })
        },
        CU_LOAN_ADVISOR_GENERATE_TIMEOUT_MS
      );

      res.json({
        ok: true,
        model: payload.model || CU_LOAN_ADVISOR_MODEL,
        response: payload.response || '',
        done: payload.done === true,
        doneReason: payload.done_reason || ''
      });
    } catch (error) {
      console.error('CU Loan Advisor Ollama generate request failed.', error);
      res.status(502).json(serializeOllamaError(error));
    }
  });
}

const originalUse = express.application.use;

express.application.use = function useWithCuLoanAdvisorProxy(...args) {
  if (!this[PROXY_INSTALLED] && !this[PROXY_INSTALLING]) {
    this[PROXY_INSTALLING] = true;
    try {
      installCuLoanAdvisorProxy(this);
      this[PROXY_INSTALLED] = true;
    } finally {
      this[PROXY_INSTALLING] = false;
    }
  }

  return originalUse.apply(this, args);
};
