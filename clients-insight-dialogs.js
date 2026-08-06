(() => {
  const triggers = [...document.querySelectorAll('[data-client-dialog-target]')];
  const dialogs = [...document.querySelectorAll('.client-insight-dialog')];

  function triggerFor(dialog) {
    return triggers.find((button) => button.dataset.clientDialogTarget === dialog.id);
  }

  function openDialog(button) {
    const dialog = document.getElementById(button.dataset.clientDialogTarget);
    if (!(dialog instanceof HTMLDialogElement)) return;

    dialogs.filter((candidate) => candidate.open && candidate !== dialog).forEach((candidate) => candidate.close());
    button.setAttribute('aria-expanded', 'true');
    dialog.showModal();

    const frame = dialog.querySelector('iframe[data-src]');
    if (frame && !frame.getAttribute('src')) {
      window.requestAnimationFrame(() => frame.setAttribute('src', frame.dataset.src));
    }
  }

  triggers.forEach((button) => button.addEventListener('click', () => openDialog(button)));

  dialogs.forEach((dialog) => {
    dialog.querySelector('[data-client-dialog-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const button = triggerFor(dialog);
      if (button) {
        button.setAttribute('aria-expanded', 'false');
        button.focus({ preventScroll: true });
      }
    });
  });
})();
