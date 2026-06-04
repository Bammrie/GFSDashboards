const advisorMessages = document.getElementById('advisor-messages');
const advisorForm = document.getElementById('advisor-form');
const advisorInput = document.getElementById('advisor-input');
const advisorFile = document.getElementById('advisor-file');
const advisorStatus = document.getElementById('advisor-status');
const advisorSend = document.getElementById('advisor-send');
const advisorTest = document.getElementById('advisor-test');

const OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'cu-loan-advisor:latest';
const OLLAMA_TIMEOUT_MS = 30_000;

const messages = [
  {
    role: 'assistant',
    content:
      'Ready. Upload loan application questions or ask what needs to be filled out next.'
  }
];

let uploadedQuestions = '';

function ollamaApiUrl(endpoint) {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${OLLAMA_BASE_URL}/api/${cleanEndpoint}`;
}

function setAdvisorStatus(text) {
  advisorStatus.textContent = text;
}

function renderMessage(message) {
  const row = document.createElement('article');
  row.className = `advisor-message advisor-message--${message.role}`;

  const role = document.createElement('p');
  role.className = 'advisor-message__role';
  role.textContent = message.role === 'assistant' ? 'CU Loan Advisor' : 'You';

  const content = document.createElement('p');
  content.className = 'advisor-message__content';
  content.textContent = message.content;

  row.append(role, content);
  advisorMessages.append(row);
  advisorMessages.scrollTop = advisorMessages.scrollHeight;
}

function renderMessages() {
  advisorMessages.innerHTML = '';
  messages.forEach(renderMessage);
}

function addMessage(role, content) {
  const message = { role, content };
  messages.push(message);
  renderMessage(message);
}

function formatOllamaError(error, method, url) {
  const name = error?.name || 'Error';
  const message = error?.message || String(error);
  return `${name}: ${message} (${method} ${url})`;
}

async function fetchOllamaJson(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  const url = ollamaApiUrl(endpoint);
  const method = options.method || 'GET';

  console.info('CU Loan Advisor Ollama request URL:', url);
  console.info('CU Loan Advisor Ollama request options:', {
    method,
    headers: options.headers || {},
    body: options.body || null
  });

  try {
    const response = await fetch(url, {
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
    console.error('CU Loan Advisor full Ollama error:', error);

    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after 30 seconds (${method} ${url})`);
    }

    throw new Error(formatOllamaError(error, method, url));
  } finally {
    window.clearTimeout(timeout);
  }
}

async function readUploadedQuestions(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) {
    setAdvisorStatus('Upload is limited to 1 MB text files.');
    advisorFile.value = '';
    return;
  }

  try {
    const text = await file.text();
    uploadedQuestions = `Uploaded loan application questions from ${file.name}:\n\n${text.trim()}`;
    setAdvisorStatus(`${file.name} loaded`);
  } catch (error) {
    console.error(error);
    setAdvisorStatus('Unable to read uploaded file.');
  } finally {
    advisorFile.value = '';
  }
}

function summarizeModels(models) {
  return models
    .map((model) => model?.name || model?.model)
    .filter(Boolean)
    .join(', ');
}

async function testOllamaConnection() {
  advisorTest.disabled = true;
  setAdvisorStatus('Testing Ollama...');

  try {
    const payload = await fetchOllamaJson('tags');
    const models = Array.isArray(payload.models) ? payload.models : [];
    const modelList = summarizeModels(models) || 'No models returned.';
    const preferredModelAvailable = models.some(
      (model) => model?.name === OLLAMA_MODEL || model?.model === OLLAMA_MODEL
    );
    const preferredStatus = preferredModelAvailable
      ? `${OLLAMA_MODEL} is available.`
      : `${OLLAMA_MODEL} was not found.`;

    console.info('CU Loan Advisor Ollama models:', payload);
    addMessage('assistant', `Ollama connection OK. ${preferredStatus}\n\nAvailable models: ${modelList}`);
    setAdvisorStatus(`Ready (${OLLAMA_MODEL})`);
  } catch (error) {
    console.error('CU Loan Advisor Ollama test failed:', error);
    addMessage('assistant', `Ollama connection failed: ${error.message}`);
    setAdvisorStatus('Connection issue');
  } finally {
    advisorTest.disabled = false;
  }
}

async function sendAdvisorMessage(event) {
  event.preventDefault();

  const typedMessage = advisorInput.value.trim();
  if (!typedMessage && !uploadedQuestions) {
    setAdvisorStatus('Enter a message or upload questions first.');
    return;
  }

  const userContent = [uploadedQuestions, typedMessage].filter(Boolean).join('\n\n');
  const displayContent = typedMessage || 'Uploaded loan application questions.';
  uploadedQuestions = '';

  addMessage('user', displayContent);
  advisorInput.value = '';
  advisorInput.disabled = true;
  advisorSend.disabled = true;
  advisorTest.disabled = true;
  setAdvisorStatus(`Thinking (${OLLAMA_MODEL})...`);

  try {
    const payload = await fetchOllamaJson('generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: userContent,
        stream: false
      })
    });

    if (!payload.response) {
      throw new Error('Ollama returned an empty response.');
    }

    addMessage('assistant', payload.response);
    setAdvisorStatus(`Ready (${payload.model || OLLAMA_MODEL})`);
  } catch (error) {
    console.error('CU Loan Advisor chat failed:', error);
    addMessage('assistant', `Ollama connection failed: ${error.message}`);
    setAdvisorStatus('Connection issue');
  } finally {
    advisorInput.disabled = false;
    advisorSend.disabled = false;
    advisorTest.disabled = false;
    advisorInput.focus();
  }
}

advisorFile.addEventListener('change', (event) => readUploadedQuestions(event.target.files?.[0]));
advisorTest.addEventListener('click', testOllamaConnection);
advisorForm.addEventListener('submit', sendAdvisorMessage);
setAdvisorStatus(`Ready (${OLLAMA_MODEL})`);
renderMessages();
