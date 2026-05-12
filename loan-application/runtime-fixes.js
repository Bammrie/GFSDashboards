(() => {
  const root = document.getElementById('root');
  if (!root) return;

  const state = {
    step: 'front',
    frontFile: null,
    backFile: null,
    loanAmount: '',
    error: '',
    mobile: window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  };

  const formatCurrency = (value) => value.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const pageShell = (title, question, help, body, showProgress = true) => `
    <div class="max-w-3xl mx-auto p-4 md:p-8">
      ${showProgress ? '<div class="h-2 bg-gray-200 rounded-full"><div class="h-2 bg-tan rounded-full transition-all" style="width: 33%"></div></div>' : ''}
      <section class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mt-6">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">${title}</h1>
        <p class="text-center text-xl mb-3">${question}</p>
        <p class="text-center text-sm text-gray-600 mb-6">${help}</p>
        <div class="flex flex-col items-center gap-3">${body}</div>
      </section>
    </div>
  `;

  const uploadBody = (side) => `
    ${state.mobile ? '<p class="text-center text-sm text-gray-600">When prompted, allow camera access so you can take the photo now.</p>' : ''}
    <label class="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50 cursor-pointer hover:border-burgundy transition">
      <span class="block text-sm font-semibold text-burgundy">Upload Your Driver's License</span>
      <span class="block text-xs text-gray-500 mt-2">${
        side === 'front'
          ? state.frontFile?.name || 'Front photo or image file'
          : state.backFile?.name || 'Back photo or image file'
      }</span>
      <input id="license-file" class="hidden" type="file" accept="image/*" capture="environment">
    </label>
    <button id="continue-btn" class="rounded-full bg-burgundy text-white px-8 py-3">Continue</button>
    ${state.step === 'back' ? '<button id="back-btn" class="text-sm text-gray-500">Back</button>' : ''}
    ${state.error ? `<p class="text-red-600 text-sm">${state.error}</p>` : ''}
  `;

  const render = () => {
    if (state.step === 'front') {
      root.innerHTML = pageShell(
        "Upload Driver's License",
        "Let's start with the front of your driver's license.",
        'Use a clear, well-lit photo so we can read the key identity details.',
        uploadBody('front')
      );
    }

    if (state.step === 'back') {
      root.innerHTML = pageShell(
        "Upload Driver's License",
        "Now upload the back of your driver's license.",
        'The barcode side helps us pull structured identity data quickly and reduce manual typing.',
        uploadBody('back')
      );
    }

    if (state.step === 'amount') {
      root.innerHTML = pageShell(
        'Loan Amount',
        'How much would you like to borrow?',
        'Enter the requested amount and we will start the conditional decision process.',
        `
          <input id="loan-amount" class="w-full border rounded-xl p-3 text-center text-xl font-semibold" inputmode="numeric" placeholder="$0.00" value="${state.loanAmount}">
          <button id="submit-btn" class="rounded-full bg-burgundy text-white px-8 py-3">Submit</button>
          <button id="back-btn" class="text-sm text-gray-500">Back</button>
          ${state.error ? `<p class="text-red-600 text-sm">${state.error}</p>` : ''}
        `
      );
    }

    if (state.step === 'waiting') {
      root.innerHTML = pageShell(
        'Application Submitted',
        'We will have your conditional approval/rejection in just a few moments.',
        'Please keep this page open while we prepare the next step.',
        `
          <div class="flex flex-col items-center gap-4 py-8">
            <div class="h-14 w-14 rounded-full border-4 border-gray-200 border-t-burgundy animate-spin"></div>
            <p class="text-sm text-gray-500 text-center">We are reviewing the license images and requested amount.</p>
          </div>
        `,
        false
      );
    }

    bindEvents();
  };

  const bindEvents = () => {
    document.getElementById('license-file')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0] || null;
      if (state.step === 'front') state.frontFile = file;
      if (state.step === 'back') state.backFile = file;
      state.error = '';
      render();
    });

    document.getElementById('continue-btn')?.addEventListener('click', () => {
      state.error = '';
      if (state.step === 'front') {
        if (!state.frontFile) {
          state.error = "Upload the front of your driver's license to continue.";
          return render();
        }
        state.step = 'back';
        return render();
      }

      if (state.step === 'back') {
        if (!state.backFile) {
          state.error = "Upload the back of your driver's license to continue.";
          return render();
        }
        state.step = 'amount';
        return render();
      }
    });

    document.getElementById('loan-amount')?.addEventListener('input', (event) => {
      state.loanAmount = formatCurrency(event.target.value);
      event.target.value = state.loanAmount;
    });

    document.getElementById('submit-btn')?.addEventListener('click', () => {
      state.error = '';
      if (!state.loanAmount) {
        state.error = 'Enter a loan amount to submit.';
        return render();
      }
      console.log('loanApplicationPrototype payload', {
        loanAmount: state.loanAmount,
        licenseFrontFileName: state.frontFile?.name || null,
        licenseBackFileName: state.backFile?.name || null
      });
      state.step = 'waiting';
      render();
    });

    document.getElementById('back-btn')?.addEventListener('click', () => {
      state.error = '';
      if (state.step === 'back') state.step = 'front';
      else if (state.step === 'amount') state.step = 'back';
      render();
    });
  };

  render();
  window.setTimeout(render, 0);
  window.setTimeout(render, 250);
  window.setTimeout(render, 750);
})();
