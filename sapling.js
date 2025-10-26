chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractText") {
    const article = document.querySelector("article") || document.querySelector("main");
    const text = (article ? article.innerText : document.body.innerText).trim();
    sendResponse({ text });
  }
  return true; // Keep channel open
});