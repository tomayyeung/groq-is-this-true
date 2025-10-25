chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelection") {
    const selectedText = window.getSelection()?.toString() || "";
    sendResponse({ selectedText });
  }
  return true; // keep channel open for async response
});