const advisorMessages = document.getElementById('advisor-messages');
const advisorForm = document.getElementById('advisor-form');
const advisorInput = document.getElementById('advisor-input');
const advisorFile = document.getElementById('advisor-file');
const advisorStatus = document.getElementById('advisor-status');
const advisorSend = document.getElementById('advisor-send');
const advisorTest = document.getElementById('advisor-test');

const DEFAULT_LOCAL_PROXY_BASE_URL = 'http://localhost:3000';
const OLLAMA_PROXY_PATH = '/api/cu-loan-advisor/ollama';
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b';
const TAGS_TIMEOUT_MS = 10_000;
const GENERATE_TIMEOUT_MS = 95_000;
const CU_LOAN_ADVISOR_SYSTEM_PROMPT = [
  'You are CU Loan Advisor for Goodwine Financial Services.',
  'Your goal is to help applicants and loan officers complete uploaded loan application questions accurately and clearly.',
  'Ask for missing information one item at a time, keep answers concise, and format completed fields so they can be transferred into the loan application.',
  'Do not invent facts, do not make final underwriting decisions, and do not provide legal, tax, or compliance advice.'
].join(' ');

const messages = [
  {
    role: 'assistant',
    content:
      'Ready. Upload loan application questions or ask what needs to be filled out next.'
  }
];

let uploadedQuestions = '';

function shouldUseSameOriginProxy() {
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

function defaultProxyBaseUrl() {
  return shouldUseSameOriginProxy() ? '' : DEFAULT_LOCAL_PROXY_BASE_URL;
}

function proxyBaseUrl() {
  return (window.localStorage.getItem('gfsOllamaProxyBaseUrl') || defaultProxyBaseUrl()).replace(/\/+$/, '');
}

function ollamaProxyUrl(endpoint) {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const path = `${OLLAMA_PROXY_PATH}/${cleanEndpoint}`;
  const baseUrl = proxyBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
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

function recentConversation() {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-12);
}

function formatConversationForPrompt(conversation) {
  return conversation
    .map((message) => `${message.role === 'assistant' ? 'CU Loan Advisor' : 'User'}: ${message.content}`)
    .join('\n\n');
}

function buildAdvisorPrompt(userContent, previousConversation) {
  const conversationText = formatConversationForPrompt(previousConversation);

  return [
    conversationText ? `Recent conversation:\n${conversationText}` : '',
    `Current user request:\n${userContent}`,
    'Respond as CU Loan Advisor with the next useful answer or question.'
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function fetchAdvisorJson(endpoint, options = {}, timeoutMs = TAGS_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const url = ollamaProxyUrl(endpoint);

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
      throw new Error(payload.error || `Proxy returned HTTP ${response.status}.`);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }

    throw error;
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
    const payload = await fetchAdvisorJson('tags', {}, TAGS_TIMEOUT_MS);
    const models = Array.isArray(payload.models) ? payload.models : [];
    const modelList = summarizeModels(models) || 'No models returned.';
    const preferredStatus = payload.preferredModelAvailable
      ? `${DEFAULT_OLLAMA_MODEL} is available.`
      : `${DEFAULT_OLLAMA_MODEL} was not found.`;

    console.info('CU Loan Advisor Ollama models:', payload);
    addMessage('assistant', `Ollama connection OK. ${preferredStatus}\n\nAvailable models: ${modelList}`);
    setAdvisorStatus(`Ready (${DEFAULT_OLLAMA_MODEL})`);
  } catch (error) {
    console.error('CU Loan Advisor Ollama test failed.', error);
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
  const previousConversation = recentConversation();

  addMessage('user', displayContent);
  advisorInput.value = '';
  advisorInput.disabled = true;
  advisorSend.disabled = true;
  advisorTest.disabled = true;
  setAdvisorStatus('Connecting to Ollama...');

  try {
    setAdvisorStatus(`Thinking (${DEFAULT_OLLAMA_MODEL})...`);

    const payload = await fetchAdvisorJson(
      'generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_OLLAMA_MODEL,
          system: CU_LOAN_ADVISOR_SYSTEM_PROMPT,
          prompt: buildAdvisorPrompt(userContent, previousConversation),
          options: {
            temperature: 0.2
          }
        })
      },
      GENERATE_TIMEOUT_MS
    );

    if (!payload.response) {
      throw new Error('Ollama returned an empty response.');
    }

    addMessage('assistant', payload.response);
    setAdvisorStatus(`Ready (${payload.model || DEFAULT_OLLAMA_MODEL})`);
  } catch (error) {
    console.error('CU Loan Advisor request failed.', error);
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
renderMessages();
