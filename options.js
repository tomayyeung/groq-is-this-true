const input = document.getElementById('groqKey');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

// Load saved key on open
chrome.storage.sync.get(['groqKey'], (items) => {
  if (items.groqKey) input.value = items.groqKey;
});

saveBtn.addEventListener('click', () => {
  const val = input.value.trim();
  if (!val) {
    status.textContent = 'Please enter a valid API key.';
    status.classList.add('error');
    return;
  }

  chrome.storage.sync.set({ groqKey: val }, () => {
    status.textContent = 'API key saved.';
    status.classList.remove('error');
    setTimeout(() => (status.textContent = ''), 3000);
  });
});
