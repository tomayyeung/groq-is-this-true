const resultEl = document.getElementById("info");
resultEl.textContent = "Loading result...";

const sourcesEl = document.getElementById("sources");

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
      if (!response.result) {
        resultEl.textContent = "(No result)";
        return;
      }

      // document.getElementById("raw-result").textContent = response.result;

      // Parse response
      const parsedResponse = response.result.split("-----");
      const info = parsedResponse[0];
      const sources = parsedResponse[1].split("---");

      resultEl.textContent = info;
      document.getElementById("sources-label").textContent = "Sources:";
      sources.forEach(source => {
        if (source.trim().length > 0) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.textContent = source;
          a.href = source;
          li.appendChild(a);
          sourcesEl.appendChild(li);
        }
      });

    });
  });
});
