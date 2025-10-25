const resultEl = document.getElementById("result");
resultEl.textContent = "Loading result...";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
    const selectedText = response?.selectedText;
    if (!selectedText) {
      resultEl.textContent = "(No text selected)";
      return;
    }

    // Send to background or API
    chrome.runtime.sendMessage({ action: "performFactCheck", text: selectedText }, (response) => {
      if (!response) {
        resultEl.textContent = "Error: no response";
        return;
      }
      if (response.error) {
        resultEl.textContent = `Error: ${response.error}`;
        return;
      }
      resultEl.textContent = response.result || "(No result)";
    });
  });
});
