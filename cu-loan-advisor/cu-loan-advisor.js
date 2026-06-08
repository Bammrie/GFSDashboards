const advisorMessages = document.getElementById('advisor-messages');
const advisorForm = document.getElementById('advisor-form');
const advisorInput = document.getElementById('advisor-input');
const advisorFile = document.getElementById('advisor-file');
const advisorStatus = document.getElementById('advisor-status');
const advisorSend = document.getElementById('advisor-send');
const advisorPromptButtons = document.querySelectorAll('[data-prompt]');

const ADVISOR_CHAT_ENDPOINT = '/api/advisor/chat';
const ADVISOR_MODEL_LABEL = 'cu-loan-advisor:latest';
const ADVISOR_TIMEOUT_MS = 30_000;
const ADVISOR_UNAVAILABLE_MESSAGE = 'The AI advisor is temporarily unavailable. Please try again.';

const messages = [
  {
    role: 'assistant',
    content:
      'I can help complete the Consumer Loan Application. To start, how much would you like to borrow, and what is the money for?'
  }
];

let uploadedNotes = '';

function setAdvisorStatus(text) {
  advisorStatus.textContent = text;
}

function resizeAdvisorInput() {
  advisorInput.style.height = 'auto';
  advisorInput.style.height = `${Math.min(advisorInput.scrollHeight, 152)}px`;
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

async function fetchAdvisorJson(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), ADVISOR_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
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
      throw new Error(payload.error || ADVISOR_UNAVAILABLE_MESSAGE);
    }

    return payload;
  } catch (error) {
    console.error('CU Loan Advisor request failed:', error);
    throw new Error(ADVISOR_UNAVAILABLE_MESSAGE);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function readUploadedNotes(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) {
    setAdvisorStatus('Upload is limited to 1 MB text files.');
    advisorFile.value = '';
    return;
  }

  try {
    const text = await file.text();
    uploadedNotes = `Uploaded session notes from ${file.name}:\n\n${text.trim()}`;
    setAdvisorStatus(`${file.name} loaded`);
  } catch (error) {
    console.error(error);
    setAdvisorStatus('Unable to read uploaded file.');
  } finally {
    advisorFile.value = '';
  }
}

function buildAdvisorMessages(currentUserContent) {
  return messages.map((message, index) => {
    const isCurrentUserMessage = index === messages.length - 1 && message.role === 'user';

    return {
      role: message.role,
      content: isCurrentUserMessage ? currentUserContent : message.content
    };
  });
}

async function sendAdvisorMessage(event) {
  event.preventDefault();

  const typedMessage = advisorInput.value.trim();
  if (!typedMessage && !uploadedNotes) {
    setAdvisorStatus('Enter a message or upload notes first.');
    return;
  }

  const userContent = [uploadedNotes, typedMessage].filter(Boolean).join('\n\n');
  const displayContent = typedMessage || 'Uploaded session notes.';
  uploadedNotes = '';

  addMessage('user', displayContent);
  advisorInput.value = '';
  resizeAdvisorInput();
  advisorInput.disabled = true;
  advisorSend.disabled = true;
  setAdvisorStatus(`Thinking (${ADVISOR_MODEL_LABEL})...`);

  try {
    const payload = await fetchAdvisorJson(ADVISOR_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: buildAdvisorMessages(userContent)
      })
    });

    const assistantContent = payload.message?.content;

    if (!assistantContent) {
      throw new Error(ADVISOR_UNAVAILABLE_MESSAGE);
    }

    addMessage('assistant', assistantContent);
    setAdvisorStatus(`Ready (${payload.model || ADVISOR_MODEL_LABEL})`);
  } catch (error) {
    console.error('CU Loan Advisor chat failed:', error);
    addMessage('assistant', ADVISOR_UNAVAILABLE_MESSAGE);
    setAdvisorStatus('Connection issue');
  } finally {
    advisorInput.disabled = false;
    advisorSend.disabled = false;
    advisorInput.focus();
  }
}

advisorFile.addEventListener('change', (event) => readUploadedNotes(event.target.files?.[0]));
advisorInput.addEventListener('input', resizeAdvisorInput);
advisorPromptButtons.forEach((button) => {
  button.addEventListener('click', () => {
    advisorInput.value = button.dataset.prompt || '';
    resizeAdvisorInput();
    advisorInput.focus();
  });
});
advisorForm.addEventListener('submit', sendAdvisorMessage);
setAdvisorStatus(`Ready (${ADVISOR_MODEL_LABEL})`);
renderMessages();
resizeAdvisorInput();
