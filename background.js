import { check } from './groq.js';

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  console.log("Extension clicked");
  chrome.tabs.sendMessage(tab.id, { action: "factCheck" });
});

// Listen for fact-check requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performFactCheck") {
    return check(message.text)
      .then(result => sendResponse({ result }))
      .catch(error => sendResponse({ error: error.message }));
  }
});
