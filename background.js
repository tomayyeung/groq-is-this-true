chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  console.log("Extension clicked");
  chrome.tabs.sendMessage(tab.id, { action: "logSelection" });
});
