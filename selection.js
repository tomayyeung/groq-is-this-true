chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const selectedText = window.getSelection()?.toString();

  if (message.action === "factCheck") {
    if (!selectedText) {
      alert("No text selected for fact-checking.");
      return;
    }

    // Send text to background script for processing
    chrome.runtime.sendMessage(
      { action: "performFactCheck", text: selectedText },
      (response) => {
        if (!response) {
          console.error("No response received from background script");
          alert("Error: No response from background script");
          return;
        }
        if (response.error) {
          console.error("Fact-check error:", response.error);
          alert(`Error: ${response.error}`);
          return;
        }

        console.log("Fact-check response:", response.result);
        alert(`Fact-check result: ${response.result}`);
      }
    );
  }
});
