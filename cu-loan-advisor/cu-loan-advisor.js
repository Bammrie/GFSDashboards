const loanStartScreen = document.getElementById('loan-start-screen');
const addressScreen = document.getElementById('address-screen');
const chatScreen = document.getElementById('chat-screen');
const loanOptionButtons = document.querySelectorAll('.loan-option');
const loanAmountInput = document.getElementById('loan-amount');
const loanAmountOutput = document.getElementById('loan-amount-output');
const loanContinue = document.getElementById('loan-continue');
const backButtons = document.querySelectorAll('[data-screen-back]');
const addressInput = document.getElementById('address-input');
const addressSuggestions = document.getElementById('address-suggestions');
const addressHelper = document.getElementById('address-helper');
const addressManual = document.getElementById('address-manual');
const addressContinue = document.getElementById('address-continue');
const advisorMessages = document.getElementById('advisor-messages');
const advisorForm = document.getElementById('advisor-form');
const advisorInput = document.getElementById('advisor-input');
const advisorFile = document.getElementById('advisor-file');
const advisorStatus = document.getElementById('advisor-status');
const advisorSend = document.getElementById('advisor-send');

const ADVISOR_CHAT_ENDPOINT = '/api/advisor/chat';
const ADDRESS_AUTOCOMPLETE_ENDPOINT = '/api/advisor/address-autocomplete';
const ADVISOR_MODEL_LABEL = 'cu-loan-advisor:latest';
const ADVISOR_TIMEOUT_MS = 30_000;
const ADDRESS_DEBOUNCE_MS = 300;
const ADVISOR_UNAVAILABLE_MESSAGE = 'The AI advisor is temporarily unavailable. Please try again.';
const ADDRESS_UNAVAILABLE_MESSAGE = "We couldn't find that address. You can keep typing or enter it manually.";

const LOAN_PURPOSE_BY_TYPE = {
  personal_loan: 'personal loan',
  vehicle_loan: 'vehicle loan',
  home_loan: 'home loan',
  credit_card: 'credit card'
};

const applicationContext = {
  loan_type: 'personal_loan',
  loan_type_label: 'Personal Loan',
  loan_purpose: 'personal loan',
  requested_amount: 30000,
  borrower_address: null
};

const messages = [
  {
    role: 'assistant',
    content: "Hi! I'm here to help you with your loan application.\n\nWhat can I help you with?"
  }
];

let uploadedNotes = '';
let selectedAddress = null;
let addressDebounce = 0;
let addressRequestId = 0;
let submittedLoanSummary = '';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function setAdvisorStatus(text) {
  advisorStatus.textContent = text;
}

function setAddressHelper(text, variant = '') {
  addressHelper.textContent = text;
  addressHelper.classList.toggle('is-success', variant === 'success');
  addressHelper.classList.toggle('is-warning', variant === 'warning');
}

function showScreen(screenId) {
  [loanStartScreen, addressScreen, chatScreen].forEach((screen) => {
    screen.hidden = screen.id !== screenId;
  });
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
  role.textContent = message.role === 'assistant' ? 'Loan Advisor' : 'You';

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

function getSelectedLoanButton() {
  return document.querySelector('.loan-option.is-selected') || loanOptionButtons[0];
}

function getLoanAmount() {
  return Number(loanAmountInput.value || 0);
}

function updateLoanAmount() {
  const amount = getLoanAmount();
  loanAmountOutput.textContent = formatCurrency(amount);
  applicationContext.requested_amount = amount;
}

function updateLoanSelection(button) {
  loanOptionButtons.forEach((loanButton) => {
    const isSelected = loanButton === button;
    loanButton.classList.toggle('is-selected', isSelected);
    loanButton.setAttribute('aria-checked', String(isSelected));
  });

  applicationContext.loan_type = button.dataset.loanType || 'personal_loan';
  applicationContext.loan_type_label = button.dataset.loanLabel || 'Personal Loan';
  applicationContext.loan_purpose = LOAN_PURPOSE_BY_TYPE[applicationContext.loan_type] || applicationContext.loan_type_label;
}

function getLoanSummaryText() {
  const amount = formatCurrency(applicationContext.requested_amount);
  const loanLabel = applicationContext.loan_type_label.toLowerCase();
  return `I'd like to borrow ${amount} for a ${loanLabel}.`;
}

function continueFromLoanStart() {
  updateLoanAmount();
  updateLoanSelection(getSelectedLoanButton());

  const loanSummary = getLoanSummaryText();
  if (loanSummary !== submittedLoanSummary) {
    addMessage('user', loanSummary);
    addMessage('assistant', "Great. Let's get started.\n\nWhat is your current home address?");
    submittedLoanSummary = loanSummary;
  }

  showScreen('address-screen');
  window.setTimeout(() => addressInput.focus(), 0);
}

function hideAddressSuggestions() {
  addressSuggestions.innerHTML = '';
  addressSuggestions.hidden = true;
}

function buildManualAddress(fullAddress) {
  return {
    full_address: fullAddress,
    street: '',
    city: '',
    state: '',
    zip: '',
    county: '',
    latitude: null,
    longitude: null,
    address_verified: false,
    raw_geoapify_result: null
  };
}

function renderAddressSuggestions(suggestions) {
  addressSuggestions.innerHTML = '';

  suggestions.forEach((suggestion) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'address-suggestion';
    button.setAttribute('role', 'option');

    const title = document.createElement('strong');
    title.textContent = suggestion.full_address || 'Verified address';

    const details = document.createElement('span');
    details.textContent = [suggestion.city, suggestion.state, suggestion.zip].filter(Boolean).join(', ');

    button.append(title, details);
    button.addEventListener('click', () => selectAddress(suggestion));
    addressSuggestions.append(button);
  });

  const manualButton = document.createElement('button');
  manualButton.type = 'button';
  manualButton.className = 'address-suggestion address-suggestion--manual';
  manualButton.setAttribute('role', 'option');

  const manualTitle = document.createElement('strong');
  manualTitle.textContent = 'Enter address manually';

  const manualDetails = document.createElement('span');
  manualDetails.textContent = 'Use what you typed and continue.';

  manualButton.append(manualTitle, manualDetails);
  manualButton.addEventListener('click', chooseManualAddress);
  addressSuggestions.append(manualButton);
  addressSuggestions.hidden = false;
}

function selectAddress(address) {
  selectedAddress = address;
  addressInput.value = address.full_address || '';
  addressContinue.disabled = !addressInput.value.trim();
  hideAddressSuggestions();
  setAddressHelper('Address verified. We will use the city, state, and ZIP from that selection.', 'success');
}

function chooseManualAddress() {
  selectedAddress = null;
  hideAddressSuggestions();
  setAddressHelper('Manual address entry selected. You can continue when the address looks right.', 'warning');
  addressContinue.disabled = !addressInput.value.trim();
  addressInput.focus();
}

async function lookupAddresses(query, requestId) {
  try {
    const payload = await fetchAdvisorJson(
      `${ADDRESS_AUTOCOMPLETE_ENDPOINT}?text=${encodeURIComponent(query)}`,
      { method: 'GET' }
    );

    if (requestId !== addressRequestId) {
      return;
    }

    const suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : [];
    if (!suggestions.length) {
      hideAddressSuggestions();
      setAddressHelper(ADDRESS_UNAVAILABLE_MESSAGE, 'warning');
      return;
    }

    setAddressHelper('Select a verified address or keep typing.');
    renderAddressSuggestions(suggestions);
  } catch (error) {
    if (requestId !== addressRequestId) {
      return;
    }

    console.error('Address autocomplete failed:', error);
    hideAddressSuggestions();
    setAddressHelper(ADDRESS_UNAVAILABLE_MESSAGE, 'warning');
  }
}

function queueAddressLookup() {
  const query = addressInput.value.trim();
  selectedAddress = null;
  addressContinue.disabled = !query;
  window.clearTimeout(addressDebounce);
  addressRequestId += 1;

  if (query.length < 3) {
    hideAddressSuggestions();
    setAddressHelper('Suggestions appear after 3 characters.');
    return;
  }

  const requestId = addressRequestId;
  setAddressHelper('Looking for that address...');
  addressDebounce = window.setTimeout(() => lookupAddresses(query, requestId), ADDRESS_DEBOUNCE_MS);
}

function continueFromAddress() {
  const fullAddress = addressInput.value.trim();
  if (!fullAddress) {
    setAddressHelper('Enter your address to continue.', 'warning');
    addressInput.focus();
    return;
  }

  const address = selectedAddress || buildManualAddress(fullAddress);
  applicationContext.borrower_address = address;

  addMessage('user', address.full_address);
  addMessage('assistant', 'Thanks. How long have you lived there?');
  showScreen('chat-screen');
  window.setTimeout(() => advisorInput.focus(), 0);
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
    uploadedNotes = `Optional uploaded notes for this session from ${file.name}:\n\n${text.trim()}`;
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
    setAdvisorStatus('Enter an answer or upload notes first.');
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
        messages: buildAdvisorMessages(userContent),
        applicationContext
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

loanOptionButtons.forEach((button) => {
  button.addEventListener('click', () => updateLoanSelection(button));
});

backButtons.forEach((button) => {
  button.addEventListener('click', () => showScreen(button.dataset.screenBack));
});

loanAmountInput.addEventListener('input', updateLoanAmount);
loanContinue.addEventListener('click', continueFromLoanStart);
addressInput.addEventListener('input', queueAddressLookup);
addressManual.addEventListener('click', chooseManualAddress);
addressContinue.addEventListener('click', continueFromAddress);
advisorFile.addEventListener('change', (event) => readUploadedNotes(event.target.files?.[0]));
advisorInput.addEventListener('input', resizeAdvisorInput);
advisorForm.addEventListener('submit', sendAdvisorMessage);

updateLoanAmount();
updateLoanSelection(getSelectedLoanButton());
setAdvisorStatus(`Ready (${ADVISOR_MODEL_LABEL})`);
renderMessages();
resizeAdvisorInput();
