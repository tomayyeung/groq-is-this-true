import { factCheck } from './groq.js';

// Listen for factCheck requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performFactCheck") {
    // Retrieve the stored API key from chrome.storage before making the call.
    chrome.storage.sync.get(["groqKey"], (items) => {
      const apiKey = items.groqKey;
      if (!apiKey) {
        sendResponse({ error: "GROQ API key not configured. Open extension options to set the key." });
        return;
      }

      factCheck(message.text, apiKey, message.currentUrl)
        .then(result => sendResponse({ result }))
        .catch(error => sendResponse({ error: error.message }));
    });

    // Keep the message channel open for the async response from storage + API
    return true;
  }
});
