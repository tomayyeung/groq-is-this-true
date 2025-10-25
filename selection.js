// Listen for getSelection request from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelection") {
    const selectedText = window.getSelection()?.toString() || "";
    const currentUrl = window.location.hostname;
    sendResponse({ selectedText, currentUrl });
  }
  return true; // keep channel open for async response
});

let popup = null;

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null
  }
}
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText && !popup) {
    console.log("Final selected text:", selectedText);
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    popup = document.createElement("div");
    popup.innerText = "@groq, is this true?";
    popup.className = "popup"
    popup.style.position = "fixed";
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - 30}px`;
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "#222";
    popup.style.color = "white";
    popup.style.padding = "6px 10px";
    popup.style.borderRadius = "6px";
    popup.style.fontSize = "14px";
    popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    popup.style.cursor = "pointer";
    popup.style.zIndex = "999999";
    popup.style.userSelect = "none";

    document.body.appendChild(popup);

    popup.addEventListener("click", function () {

      //call popup.js

      removePopup();
      window.getSelection().removeAllRanges();
      alert("clicked popup");
    });
  } else if (popup && !popup.contains(event.target)) {
    console.log("there is a popup!");
    removePopup();
  }

});
