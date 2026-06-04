const advisorMessages = document.getElementById('advisor-messages');
const advisorForm = document.getElementById('advisor-form');
const advisorInput = document.getElementById('advisor-input');
const advisorFile = document.getElementById('advisor-file');
const advisorStatus = document.getElementById('advisor-status');
const advisorSend = document.getElementById('advisor-send');

const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.1';
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
let resolvedModel = window.localStorage.getItem('gfsOllamaModel') || '';

function ollamaBaseUrl() {
  return (window.localStorage.getItem('gfsOllamaBaseUrl') || DEFAULT_OLLAMA_BASE_URL).replace(/\/+$/, '');
}

function ollamaApiUrl(endpoint) {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${ollamaBaseUrl()}/api/${cleanEndpoint}`;
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

async function resolveOllamaModel() {
  if (resolvedModel) return resolvedModel;

  try {
    const response = await fetch(ollamaApiUrl('tags'));
    const payload = await response.json();
    resolvedModel = payload.models?.[0]?.name || DEFAULT_OLLAMA_MODEL;
  } catch (error) {
    console.warn('Unable to read Ollama model tags.', error);
    resolvedModel = DEFAULT_OLLAMA_MODEL;
  }

  return resolvedModel;
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
  setAdvisorStatus('Connecting to Ollama...');

  try {
    const model = await resolveOllamaModel();
    setAdvisorStatus(`Thinking (${model})...`);

    const response = await fetch(ollamaApiUrl('chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: 'system', content: CU_LOAN_ADVISOR_SYSTEM_PROMPT },
          ...recentConversation().slice(0, -1),
          { role: 'user', content: userContent }
        ],
        options: {
          temperature: 0.2
        }
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'Ollama did not return a successful chat response.');
    }

    addMessage('assistant', payload.message?.content || 'I did not receive a response from Ollama.');
    setAdvisorStatus(`Ready (${payload.model || model})`);
  } catch (error) {
    console.error(error);
    addMessage(
      'assistant',
      'I could not reach local Ollama. Confirm Ollama is running on localhost:11434 and allow this dashboard origin in OLLAMA_ORIGINS if your browser blocks the request.'
    );
    setAdvisorStatus('Connection issue');
  } finally {
    advisorInput.disabled = false;
    advisorSend.disabled = false;
    advisorInput.focus();
  }
}

advisorFile.addEventListener('change', (event) => readUploadedQuestions(event.target.files?.[0]));
advisorForm.addEventListener('submit', sendAdvisorMessage);
renderMessages();
