import { factCheck } from './groq.js';

// Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performFactCheck") {
    performFactCheck(message, sendResponse);
  } else if (message.action === "captureAndCrop") {
    captureAndCrop(message, sendResponse);
  } else if (message.action === "open_extension_popup") {
    openExtensionPopup();
  }
  return true; // keep channel open for async response
});

// Called for message action "performFactCheck". Message should have text and currentUrl. Will call sendResponse with result (string) or error.
function performFactCheck(message, sendResponse) {
  // Retrieve the stored API key from chrome.storage before making the call.
  chrome.storage.sync.get(["groqKey"], (items) => {
    const apiKey = items.groqKey;
    if (!apiKey) {
      sendResponse({ error: "GROQ API key not configured. Open extension options to set the key." });
      return;
    }

    factCheck(message.text, apiKey, message.currentUrl)
      .then(result => sendResponse({ result }))
      .catch(error => sendResponse({ error: error.message }));
  });
}

// Called for message action "captureAndCrop". Message should have rect. Will call sendResponse with success (boolean) or error (with a message). 
function captureAndCrop(message, sendResponse) {
  // Capture the visible tab
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      sendResponse({ error: chrome.runtime.lastError.message });
      return;
    }

    // Crop the image based on the selection rect
    cropImage(dataUrl, message.rect).then(croppedDataUrl => {
      // Send to Sightengine API for AI detection
      detectAIImage(croppedDataUrl).then(result => {
        const resultData = {
          action: "aiDetectionResult",
          result: result.type
        };
        // Store in chrome.storage.local first for popup persistence
        chrome.storage.local.set({ pendingAIResult: resultData }, () => {
          // Wait a moment to ensure storage is written, then reopen popup
          setTimeout(() => {
            chrome.action.openPopup(() => {
              if (chrome.runtime.lastError) {
                console.log('Could not open popup:', chrome.runtime.lastError);
              }
            });
          }, 100);
        });
        sendResponse({ success: true });
      }).catch(error => {
        const errorData = {
          action: "aiDetectionResult",
          error: error.message
        };
        // Store error in chrome.storage.local first
        chrome.storage.local.set({ pendingAIResult: errorData }, () => {
          // Wait a moment to ensure storage is written, then reopen popup
          setTimeout(() => {
            chrome.action.openPopup(() => {
              if (chrome.runtime.lastError) {
                console.log('Could not open popup:', chrome.runtime.lastError);
              }
            });
          }, 100);
        });
        sendResponse({ error: error.message });
      });
    }).catch(error => {
      sendResponse({ error: error.message });
    });
  });
}

// Called for message action "open_extension_popup". Used by popup to open the extension when the user clicks the tooltip.
function openExtensionPopup() {
  // Programmatically open the extension's popup
  if (chrome.action.openPopup) {
    chrome.action.openPopup();
  } else {
    console.warn("chrome.action.openPopup not available in this Chrome version or context.");
  }
}

// Helper function for captureAndCrop() to crop the image
function cropImage(dataUrl, rect) {
  return new Promise((resolve, reject) => {
    // Create an ImageBitmap from the data URL
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => createImageBitmap(blob))
      .then(imageBitmap => {
        const canvas = new OffscreenCanvas(rect.width, rect.height);
        const ctx = canvas.getContext('2d');

        // Account for device pixel ratio
        const dpr = rect.devicePixelRatio || 1;

        ctx.drawImage(
          imageBitmap,
          rect.x * dpr,
          rect.y * dpr,
          rect.width * dpr,
          rect.height * dpr,
          0,
          0,
          rect.width,
          rect.height
        );

        return canvas.convertToBlob({ type: 'image/png' });
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

// Helper function for captureAndCrop() to detect AI-generated image using Sightengine API
async function detectAIImage(imageDataUrl) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["sightengineUser", "sightengineSecret"], async (items) => {
      const apiUser = items.sightengineUser;
      const apiSecret = items.sightengineSecret;

      if (!apiUser || !apiSecret) {
        reject(new Error("Sightengine API credentials not configured. Open extension options to set them."));
        return;
      }

      try {
        // Convert data URL to blob
        const blob = await (await fetch(imageDataUrl)).blob();

        // Create form data
        const formData = new FormData();
        formData.append('media', blob, 'screenshot.png');
        formData.append('models', 'genai');
        formData.append('api_user', apiUser);
        formData.append('api_secret', apiSecret);

        // Send to Sightengine API
        const response = await fetch('https://api.sightengine.com/1.0/check.json', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          resolve(result);
        } else {
          reject(new Error(result.error?.message || 'API request failed'));
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}
