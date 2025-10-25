chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "logSelection") {
    const selectedText = window.getSelection()?.toString();
    console.log("Selected text:", selectedText || "No text selected");
    alert(`You selected: ${selectedText}`);
  }
});
