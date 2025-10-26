const resultEl = document.getElementById("info");
const sourcesEl = document.getElementById("sources");
const aiResultEl = document.getElementById("ai-result");
const currentUrlEl = document.getElementById("current-url");
const biasInfoEl = document.getElementById("bias-info");
const biasDetailsEl = document.getElementById("bias-details");

// Load news bias data
let newsBiasData = [];
fetch(chrome.runtime.getURL('news-bias.json'))
  .then(response => response.json())
  .then(data => {
    newsBiasData = data;
  })
  .catch(error => console.error('Error loading bias data:', error));

// Function to find bias information for a hostname
function findBiasInfo(hostname) {
  // Remove www. prefix for matching
  const cleanHost = hostname.replace(/^www\./, '');
  
  // Look for exact match or domain match
  const match = newsBiasData.find(entry => {
    const entryUrl = entry.url.replace(/^www\./, '').replace(/\/$/, '');
    return entryUrl === cleanHost || cleanHost.endsWith(entryUrl);
  });
  
  return match;
}

// Function to load and display bias information
function loadBiasInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      biasDetailsEl.textContent = "Error: No active tab found";
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
      if (chrome.runtime.lastError) {
        biasDetailsEl.textContent = "Error: Could not connect to page. Try refreshing the page.";
        console.error(chrome.runtime.lastError);
        return;
      }

      const currentHost = response?.currentHost;
      if (!currentHost) {
        biasDetailsEl.textContent = "Could not get current host";
        return;
      }

      const biasData = findBiasInfo(currentHost);
      displayBiasInfo(biasData, currentHost);
    });
  });
}

// Function to display bias information
function displayBiasInfo(biasData, hostname) {
  if (!biasData) {
    biasDetailsEl.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
        <div style="font-weight: bold; margin-bottom: 4px;">No bias data found</div>
        <div style="font-size: 12px; color: #666;">
          Source: ${hostname}
        </div>
        <div style="font-size: 11px; color: #999; margin-top: 8px;">
          This source is not in our bias database
        </div>
      </div>
    `;
    return;
  }
  
  const biasColors = {
    'left': '#4285f4',
    'left-center': '#7cb5ec',
    'center': '#90ed7d',
    'right-center': '#f7a35c',
    'right': '#f45b5b',
    'pro-science': '#8085e9'
  };
  
  const bgColor = biasColors[biasData.bias] || '#f0f0f0';
  
  biasInfoEl.style.backgroundColor = bgColor + '20'; // 20 for transparency
  biasInfoEl.style.border = `2px solid ${bgColor}`;
  
  biasDetailsEl.innerHTML = `
    <div style="text-align: center; padding: 10px;">
      <div style="font-size: 28px; margin-bottom: 8px;">⚖️</div>
      <div style="font-weight: bold; font-size: 18px; color: ${bgColor}; margin-bottom: 8px;">
        ${biasData.bias.toUpperCase()}
      </div>
      <div style="font-size: 13px; margin-bottom: 4px;">
        <strong>Source:</strong> ${biasData.name}
      </div>
      <div style="font-size: 13px; margin-bottom: 4px;">
        <strong>Factual Reporting:</strong> ${biasData.factual}
      </div>
      <div style="font-size: 13px; margin-bottom: 12px;">
        <strong>Credibility:</strong> ${biasData.credibility}
      </div>
      <a href="${biasData.profile}" target="_blank" style="color: ${bgColor}; font-size: 12px; text-decoration: none;">
        View full profile →
      </a>
    </div>
  `;
}

// Mode switching
const factCheckBtn = document.getElementById("fact-check-mode");
const factCheckSection = document.getElementById("fact-check-section");
const aiDetectBtn = document.getElementById("ai-detect-mode");
const aiDetectSection = document.getElementById("ai-detect-section");
const aiTextDetectBtn = document.getElementById("ai-text-detect-mode");
const aiTextDetectSection = document.getElementById("ai-text-detect-section");
const biasCheckBtn = document.getElementById("bias-check-mode");
const biasCheckSection = document.getElementById("bias-check-section");

let currentMode = "fact-check";

factCheckBtn.addEventListener("click", () => {
  currentMode = "fact-check";
  factCheckSection.classList.add("active");
  factCheckBtn.classList.add('active');
  aiDetectSection.classList.remove("active");
  aiDetectBtn.classList.remove('active');
  aiTextDetectSection.classList.remove("active");
  aiTextDetectBtn.classList.remove('active');
  biasCheckSection.classList.remove("active");
  biasCheckBtn.classList.remove('active');
});

aiDetectBtn.addEventListener("click", () => {
  currentMode = "ai-detect";
  aiDetectSection.classList.add("active");
  aiDetectBtn.classList.add('active');
  factCheckSection.classList.remove("active");
  factCheckBtn.classList.remove('active');
  aiTextDetectSection.classList.remove("active");
  aiTextDetectBtn.classList.remove('active');
  biasCheckSection.classList.remove("active");
  biasCheckBtn.classList.remove('active');
});

aiTextDetectBtn.addEventListener("click", () => {
  currentMode = "ai-text-detect";
  aiTextDetectSection.classList.add("active");
  aiTextDetectBtn.classList.add('active');
  factCheckSection.classList.remove("active");
  factCheckBtn.classList.remove('active');
  aiDetectSection.classList.remove("active");
  aiDetectBtn.classList.remove('active');
  biasCheckSection.classList.remove("active");
  biasCheckBtn.classList.remove('active');
});

biasCheckBtn.addEventListener("click", () => {
  currentMode = "bias-check";
  biasCheckSection.classList.add("active");
  biasCheckBtn.classList.add('active');
  factCheckSection.classList.remove("active");
  factCheckBtn.classList.remove('active');
  aiDetectSection.classList.remove("active");
  aiDetectBtn.classList.remove('active');
  aiTextDetectSection.classList.remove("active");
  aiTextDetectBtn.classList.remove('active');
  
  // Load bias info when switching to this mode
  loadBiasInfo();
});

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

      // currentUrlEl.textContent = currentUrl;

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
    // Switch to AI detect mode and display the one-time result that the
    // background stored when it auto-opened the popup after detection.
    currentMode = "ai-detect";
    aiDetectSection.classList.add("active");
    factCheckSection.classList.remove("active");
    aiDetectBtn.classList.add('active');
    factCheckBtn.classList.remove('active');

    // Display the result then clear it so future popup opens default to
    // fact-check mode unless another capture runs.
    displayAIResult(result.pendingAIResult);
    chrome.storage.local.remove(['pendingAIResult']);
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
          ${percentage}% AI
        </div>

      </div>
    `;
  }
}


document.getElementById("check-for-ai-text").addEventListener("click", async () => {
  const resultDiv = document.getElementById("ai-text-result");
  resultDiv.textContent = "Extracting text from page...";

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Ask content script for page text
  chrome.tabs.sendMessage(tab.id, { action: "extractText" }, async (response) => {
    if (!response || !response.text) {
      resultDiv.textContent = "Could not extract text from this page.";
      return;
    }

    const text = response.text.slice(0, 5000); // limit length if needed
    resultDiv.textContent = "Analyzing text with Sapling AI...";

    try {
      const analysis = await analyzeWithSapling(text);
      const analysisNum = parseFloat(analysis.score);


      let bgColor, emoji, label;
    if (analysisNum > 0.7) {
      bgColor = '#f44336';
      emoji = '🤖';
      label = 'Very Likely AI-Generated';
    } else if (analysisNum > 0.5) {
      bgColor = '#ff9800';
      emoji = '⚠️';
      label = 'Possibly AI-Generated';
    } else if (analysisNum > 0.3) {
      bgColor = '#ffc107';
      emoji = '🤔';
      label = 'Uncertain';
    } else {
      bgColor = '#4CAF50';
      emoji = '✅';
      label = 'Likely Real';
    }

      resultDiv.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 32px; margin-bottom: 8px;">${emoji}</div>
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: ${bgColor};">
          ${label}
        </div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
          ${percentage}% AI
        </div>

      </div>
    `;
    } catch (err) {
      resultDiv.textContent = "Error: " + err.message;
    }
  });
});

async function analyzeWithSapling(text) {
  // Retrieve key from storage (you said you store it in options)
  const { saplingAPIKey } = await chrome.storage.sync.get("saplingAPIKey");

  if (!saplingAPIKey) {
    throw new Error("Sapling API key not configured in extension options.");
  }

  const response = await fetch("https://api.sapling.ai/api/v1/aidetect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: saplingAPIKey,
      text: text
    })
  });

  if (!response.ok) throw new Error("API error: " + response.status);

  return await response.json();
}