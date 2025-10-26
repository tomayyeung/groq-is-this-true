function extractArticleText() {
  let paragraphs = [];

  // Prefer <article> content if it exists
  const article = document.querySelector("article");
  if (article) {
    paragraphs = Array.from(article.querySelectorAll("p"));
  } else {
    // Fallback: get all <p> tags in the document
    paragraphs = Array.from(document.querySelectorAll("p"));
  }

  // Extract text and clean it up
  const text = paragraphs
    .map(p => p.innerText.trim())
    .filter(t => t.length > 0)
    .join("\n\n"); // Separate paragraphs clearly

  return text;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractText") {
    const articleText = extractArticleText();
    sendResponse({ text: articleText });
  }
});