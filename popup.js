const resultEl = document.getElementById("info");
const sourcesEl = document.getElementById("sources");
const aiResultEl = document.getElementById("ai-result");
const currentUrlEl = document.getElementById("current-url");

// Mode switching
const factCheckBtn = document.getElementById("fact-check-mode");
const aiDetectBtn = document.getElementById("ai-detect-mode");
const factCheckSection = document.getElementById("fact-check-section");
const aiDetectSection = document.getElementById("ai-detect-section");

let currentMode = "fact-check";

factCheckBtn.addEventListener("click", () => {
  currentMode = "fact-check";
  factCheckSection.classList.add("active");
  aiDetectSection.classList.remove("active");
  factCheckBtn.style.opacity = "1";
  aiDetectBtn.style.opacity = "0.6";
});

aiDetectBtn.addEventListener("click", () => {
  currentMode = "ai-detect";
  aiDetectSection.classList.add("active");
  factCheckSection.classList.remove("active");
  aiDetectBtn.style.opacity = "1";
  factCheckBtn.style.opacity = "0.6";
});

// Initial mode setup
factCheckBtn.style.opacity = "1";
aiDetectBtn.style.opacity = "0.6";

// Fact check functionality
function performFactCheck() {
  resultEl.textContent = "Loading result...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      resultEl.textContent = "Error: No active tab found";
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
      if (chrome.runtime.lastError) {
        resultEl.textContent = "Error: Could not connect to page. Try refreshing the page.";
        console.error(chrome.runtime.lastError);
        return;
      }

      const selectedText = response?.selectedText;
      // if (!selectedText) {
      //   resultEl.textContent = "(No text selected)";
      //   return;
      // }

      const currentHost = response?.currentHost;
      if (!currentHost) {
        resultEl.textContent = "(Could not get current host)";
        return;
      }


      const currentUrl = response?.currentUrl;
      if (!currentUrl) {
        resultEl.textContent = "(Could not get current URL)";
        return;
      }

      currentUrlEl.textContent = currentUrl;

      // Fact check the selected text
      chrome.runtime.sendMessage({ action: "performFactCheck", text: selectedText, currentUrl: currentUrl, currentHost: currentHost}, (response) => {
        if (chrome.runtime.lastError) {
          resultEl.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
        }
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

        console.log(response.result);

        // Parse response
        const parsedResponse = response.result.split("^^^^^");
        const info = parsedResponse[0];

        resultEl.textContent = info;

        // Only process sources if the delimiter was present
        if (parsedResponse.length > 1 && parsedResponse[1]) {
          const sources = parsedResponse[1].split("^^^");
          document.getElementById("sources-label").textContent = "Sources:";
          sources.forEach(source => {
            if (source.trim().length > 0) {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.textContent = source;
              a.href = source;
              a.target = "_blank";
              li.appendChild(a);
              sourcesEl.appendChild(li);
            }
          });
        }
      });
    });
  });
}

// AI Detection functionality
document.getElementById("capture-screenshot").addEventListener("click", () => {
  // Clear any previous results when starting new capture
  chrome.storage.local.remove(['pendingAIResult']);
  aiResultEl.textContent = "Activating selection mode...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      aiResultEl.textContent = "Error: No active tab found";
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: "startScreenshotCapture" }, (response) => {
      if (chrome.runtime.lastError) {
        aiResultEl.textContent = "Error: Could not connect to page. Try refreshing the page.";
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response?.success) {
        aiResultEl.textContent = "📸 Click and drag on the page to select an area. Analyzing...";
      } else {
        aiResultEl.textContent = "Error: Could not activate screenshot mode";
      }
    });
  });
});

// Run fact check on load if in fact-check mode
if (currentMode === "fact-check") {
  performFactCheck();
}

// Check for pending AI detection results when popup opens
chrome.storage.local.get(['pendingAIResult'], (result) => {
  if (result.pendingAIResult) {
    // Switch to AI detect mode
    currentMode = "ai-detect";
    aiDetectSection.classList.add("active");
    factCheckSection.classList.remove("active");
    aiDetectBtn.style.opacity = "1";
    factCheckBtn.style.opacity = "0.6";

    // Display the result
    displayAIResult(result.pendingAIResult);
    // Don't clear storage here - let it persist until next capture
  }
});

function displayAIResult(data) {
  if (data.error) {
    aiResultEl.innerHTML = `<strong style="color: #f44336;">❌ Error</strong><br/>${data.error}`;
  } else if (data.result && data.result.ai_generated !== undefined) {
    const aiScore = data.result.ai_generated;
    const percentage = (aiScore * 100).toFixed(1);

    // Color coding based on likelihood
    let bgColor, emoji, label;
    if (aiScore > 0.7) {
      bgColor = '#f44336';
      emoji = '🤖';
      label = 'Very Likely AI-Generated';
    } else if (aiScore > 0.5) {
      bgColor = '#ff9800';
      emoji = '⚠️';
      label = 'Possibly AI-Generated';
    } else if (aiScore > 0.3) {
      bgColor = '#ffc107';
      emoji = '🤔';
      label = 'Uncertain';
    } else {
      bgColor = '#4CAF50';
      emoji = '✅';
      label = 'Likely Real';
    }

    aiResultEl.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 32px; margin-bottom: 8px;">${emoji}</div>
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: ${bgColor};">
          ${label}
        </div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
          ${percentage}%
        </div>
        <div style="font-size: 12px; color: #666;">
          AI confidence score: ${aiScore.toFixed(3)}
        </div>
      </div>
    `;
  }
}
