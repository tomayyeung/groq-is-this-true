const groqKeyInput = document.getElementById('groqKey');
const sightengineUserInput = document.getElementById('sightengineUser');
const sightengineSecretInput = document.getElementById('sightengineSecret');
const saplingAPIKeyInput = document.getElementById('saplingAPIKey');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

// Load saved keys on open
chrome.storage.sync.get(['groqKey', 'sightengineUser', 'sightengineSecret'], (items) => {
  if (items.groqKey) groqKeyInput.value = items.groqKey;
  if (items.sightengineUser) sightengineUserInput.value = items.sightengineUser;
  if (items.sightengineSecret) sightengineSecretInput.value = items.sightengineSecret;
});

saveBtn.addEventListener('click', () => {
  const groqKey = groqKeyInput.value.trim();
  const sightengineUser = sightengineUserInput.value.trim();
  const sightengineSecret = sightengineSecretInput.value.trim();
  const saplingAPIKey = saplingAPIKeyInput.value.trim();

  if (!groqKey && !sightengineUser && !sightengineSecret && !saplingAPIKey) {
    status.textContent = 'Please enter at least one API credential.';
    status.classList.add('error');
    return;
  }

  const settings = {};
  if (groqKey) settings.groqKey = groqKey;
  if (sightengineUser) settings.sightengineUser = sightengineUser;
  if (sightengineSecret) settings.sightengineSecret = sightengineSecret;
  if (saplingAPIKey) settings.saplingAPIKey = saplingAPIKey;

  chrome.storage.sync.set(settings, () => {
    status.textContent = 'Settings saved successfully!';
    status.classList.remove('error');
    setTimeout(() => (status.textContent = ''), 3000);
  });
});
