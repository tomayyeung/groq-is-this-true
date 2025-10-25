chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const selection = window.getSelection()?.toString();
      if (selection) {
        alert(`You selected: "${selection}"`);
        console.log("Selected text:", selection);
      } else {
        alert("No text selected!");
      }
    },
  });
});
