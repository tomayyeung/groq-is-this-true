# groq-is-this-true

A Chrome extension for fact-checking text and detecting AI-generated images.

## Features

### 📝 Fact Checking
- Select text on any webpage to fact-check it using Groq AI
- Get instant verification with sources

### 🖼️ AI Image Detection
- Capture and analyze screenshots to detect AI-generated images
- Uses Sightengine's AI detection API
- Interactive cropper to select specific areas of the page
- Visual confidence indicators

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Configure API Keys
1. Load the extension in Chrome (Developer mode)
2. Click on the extension icon and go to Options
3. Enter your API credentials:
   - **GROQ API Key**: Get from [console.groq.com](https://console.groq.com)
   - **Sightengine API User & Secret**: Get from [sightengine.com](https://sightengine.com)

## Usage

### Fact Check Text
1. Select any text on a webpage
2. Click the extension icon
3. Click "📝 Fact Check" button
4. View the fact-check results and sources

### Detect AI Images
1. Click the extension icon
2. Click "🖼️ AI Detect" button
3. Click "📸 Capture Screenshot"
4. Draw a rectangle around the image you want to analyze
5. View the AI detection results with confidence score

## How It Works

### Screenshot Capture Flow
1. User clicks "Capture Screenshot" in the popup
2. Content script (`selection.js`) creates an overlay with crosshair cursor
3. User draws a rectangle to select the area
4. Screenshot is captured using `chrome.tabs.captureVisibleTab`
5. Image is cropped to the selected area
6. Cropped image is sent to Sightengine API for AI detection
7. Results are displayed in the popup

### Technologies Used
- **Groq AI**: For fact-checking text content
- **Sightengine API**: For AI-generated image detection
- **Cropper.js**: For interactive screenshot selection
- **Chrome Extension APIs**: For browser integration

## Development Ideas

- agentic
  - automatically scans the site when you open it without us clicking the button
  - only alerts when there's misinformation
  - pro plan?
- website bias checker
  - there are some tools out there that can tell you how biased a website is / what their media bias is
  - https://www.allsides.com/media-bias/media-bias-chart
  - can try to find an api? if not, just hard code some shit
  - cache results?
- edit dom
  - when we find misinformation in the text, highlight it in red
- sources
  - the extension should display sources that agree / disagree in a more organized ui. instead of just somewhere in the paragraph blob that groq gives

## License

MIT
