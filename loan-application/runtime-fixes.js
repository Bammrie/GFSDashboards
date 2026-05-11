(() => {
  const stepKey = 'loanStep';
  const appKey = 'loanApp';
  const historyKey = 'loanStepHistoryPatch';
  const firstStep = 'loanPurpose';
  const completionStep = 'completion';
  const vinPromptStep = 'vehiclePrice';
  const nextAfterVin = 'downPayment';
  let lastStep = localStorage.getItem(stepKey) || firstStep;
  const wiredButtons = new WeakSet();

  const readJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '') || fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const rememberStep = (stepId) => {
    if (!stepId) return;
    const history = readJson(historyKey, []);
    if (history[history.length - 1] !== stepId) {
      writeJson(historyKey, [...history, stepId].slice(-40));
    }
  };

  const setStepAndReload = (stepId) => {
    localStorage.setItem(stepKey, stepId);
    window.location.reload();
  };

  const goBack = () => {
    const history = readJson(historyKey, []);
    const previousStep = history.pop();
    writeJson(historyKey, history);
    setStepAndReload(previousStep || firstStep);
  };

  const updateHistoryFromReact = () => {
    const currentStep = localStorage.getItem(stepKey) || firstStep;
    if (currentStep !== lastStep) {
      rememberStep(lastStep);
      lastStep = currentStep;
    }
  };

  const buttonClass = 'rounded-full bg-burgundy text-white px-8 py-3';
  const secondaryClass = 'text-sm text-gray-500';

  const makeButton = (label, className, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      onClick();
    }, true);
    return button;
  };

  const saveApplicationPatch = (patch) => {
    const application = readJson(appKey, {});
    writeJson(appKey, { ...application, ...patch });
  };

  const renderVinChoice = (prompt, container) => {
    prompt.textContent = 'Do you know the VIN?';
    container.replaceChildren(
      makeButton('Yes', buttonClass, () => showVinEntry(prompt, container)),
      makeButton('No', buttonClass, () => {
        rememberStep(vinPromptStep);
        saveApplicationPatch({ knowsVin: 'No', vin: '' });
        setStepAndReload(nextAfterVin);
      }),
      makeButton('Back', secondaryClass, goBack)
    );
  };

  function showVinEntry(prompt, container) {
    prompt.textContent = 'Enter the VIN';
    container.replaceChildren();
    const input = document.createElement('input');
    input.className = 'w-full border rounded-xl p-3';
    input.placeholder = 'VIN';
    input.autocomplete = 'off';
    container.append(
      input,
      makeButton('Continue', buttonClass, () => {
        const vin = input.value.trim();
        if (!vin) return;
        rememberStep(vinPromptStep);
        saveApplicationPatch({ knowsVin: 'Yes', vin });
        setStepAndReload(nextAfterVin);
      }),
      makeButton('Back', secondaryClass, () => renderVinChoice(prompt, container))
    );
    input.focus();
  }

  const showVinPrompt = () => {
    const prompt = Array.from(document.querySelectorAll('p')).find(
      (item) => item.textContent?.trim() === 'Estimated vehicle price'
    );
    if (!prompt) return;

    const section = prompt.closest('section');
    const container = section?.querySelector('.flex.flex-col.items-center.gap-3');
    if (!container || container.getAttribute('data-vin-prompt') === 'true') return;

    container.setAttribute('data-vin-prompt', 'true');
    renderVinChoice(prompt, container);
  };

  const replaceStartOverWithBack = () => {
    const currentStep = localStorage.getItem(stepKey) || firstStep;
    if (currentStep === firstStep || currentStep === completionStep) return;

    for (const button of document.querySelectorAll('button')) {
      if (button.textContent?.trim() !== 'Start Over' || wiredButtons.has(button)) continue;
      button.textContent = 'Back';
      wiredButtons.add(button);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        goBack();
      }, true);
    }
  };

  const applyFixes = () => {
    updateHistoryFromReact();
    showVinPrompt();
    replaceStartOverWithBack();
  };

  new MutationObserver(applyFixes).observe(document.documentElement, { childList: true, subtree: true });
  window.setInterval(applyFixes, 200);
  applyFixes();
})();
