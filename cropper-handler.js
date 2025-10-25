let selectionOverlay = null;
let selectionBox = null;
let startX, startY;
let isSelecting = false;

// Listen for messages to start cropping
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScreenshotCapture") {
    initializeSelectionMode();
    sendResponse({ success: true });
  }
  return true;
});

function initializeSelectionMode() {
  // Create semi-transparent overlay
  selectionOverlay = document.createElement('div');
  selectionOverlay.id = 'groq-selection-overlay';
  selectionOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2147483647;
    cursor: crosshair;
  `;

  // Create selection box
  selectionBox = document.createElement('div');
  selectionBox.id = 'groq-selection-box';
  selectionBox.style.cssText = `
    position: fixed;
    border: 2px solid #2196F3;
    background: rgba(33, 150, 243, 0.1);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
    z-index: 2147483648;
    display: none;
    pointer-events: none;
  `;

  // Create instruction text
  const instructionText = document.createElement('div');
  instructionText.id = 'groq-instruction-text';
  instructionText.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2196F3;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 2147483649;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  instructionText.textContent = '🖼️ Click and drag to select an area • Press ESC to cancel';

  document.body.appendChild(selectionOverlay);
  document.body.appendChild(selectionBox);
  document.body.appendChild(instructionText);

  // Event listeners
  selectionOverlay.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
}

function onMouseDown(e) {
  e.preventDefault();
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'block';
}

function onMouseMove(e) {
  if (!isSelecting) return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const left = Math.min(currentX, startX);
  const top = Math.min(currentY, startY);
  
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
}

function onMouseUp(e) {
  if (!isSelecting) return;
  isSelecting = false;
  
  const rect = {
    left: parseInt(selectionBox.style.left),
    top: parseInt(selectionBox.style.top),
    width: parseInt(selectionBox.style.width),
    height: parseInt(selectionBox.style.height)
  };
  
  // Minimum selection size - automatically capture if valid
  if (rect.width > 20 && rect.height > 20) {
    captureSelectedArea(rect);
  } else {
    cleanupSelectionMode();
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    cleanupSelectionMode();
  }
}

function captureSelectedArea(rect) {
  // Hide UI elements temporarily
  const overlay = document.getElementById('groq-selection-overlay');
  const box = document.getElementById('groq-selection-box');
  const instruction = document.getElementById('groq-instruction-text');
  
  if (overlay) overlay.style.display = 'none';
  if (box) box.style.display = 'none';
  if (instruction) instruction.style.display = 'none';
  
  // Small delay to let the DOM update
  setTimeout(() => {
    // Send message to background to capture the visible tab
    chrome.runtime.sendMessage({ 
      action: "captureAndCrop",
      rect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    }, (response) => {
      cleanupSelectionMode();
      
      if (response?.error) {
        alert('Error capturing screenshot: ' + response.error);
      }
      // Popup will be reopened automatically by background script after storing results
    });
  }, 100);
}

function cleanupSelectionMode() {
  if (selectionOverlay) {
    selectionOverlay.removeEventListener('mousedown', onMouseDown);
    selectionOverlay.remove();
    selectionOverlay = null;
  }
  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }
  const instruction = document.getElementById('groq-instruction-text');
  if (instruction) {
    instruction.remove();
  }
  
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('keydown', onKeyDown);
  isSelecting = false;
}
