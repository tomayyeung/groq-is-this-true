# Setup & Usage Guide

## Quick Start

### 1. Get Your API Keys

#### Groq API Key (for fact-checking)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

#### Sightengine API Credentials (for AI image detection)
1. Visit [sightengine.com](https://sightengine.com)
2. Sign up for a free account
3. Go to your dashboard
4. Find your **API User** and **API Secret**
5. Copy both values

### 2. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `groq-is-this-true` folder
5. The extension icon should appear in your toolbar

### 3. Configure API Keys

1. Click the extension icon
2. Click on "Options" or right-click the icon → "Options"
3. Enter your API credentials:
   - GROQ API Key
   - Sightengine API User
   - Sightengine API Secret
4. Click "Save All Settings"

## Usage

### Feature 1: Fact Check Text

1. **Select text** on any webpage
2. **Click the extension icon**
3. The "Fact Check" tab should be active by default
4. View the fact-check results and sources

### Feature 2: Detect AI-Generated Images

1. **Click the extension icon**
2. **Click "🖼️ AI Detect" button** to switch to AI detection mode
3. **Click "📸 Capture Screenshot"** button
4. Your screen will show a semi-transparent overlay
5. **Click and drag** to draw a rectangle around the image you want to analyze
6. **Release the mouse** to capture
7. The extension will analyze the selected area and show:
   - Whether it's AI-generated or real
   - Confidence percentage
   - AI probability score

### Tips for AI Detection

- ✅ **Select clear images**: The detection works best on clear, high-quality images
- ✅ **Select the whole image**: Make sure to include the entire image in your selection
- ✅ **Press ESC to cancel**: If you want to start over, press the Escape key
- ⚠️ **API limits**: Free Sightengine accounts have usage limits (check their pricing)

## Troubleshooting

### "API key not configured" Error
- Go to extension Options and make sure you've saved your API keys
- Make sure the keys are correct and haven't expired

### "Error: no response" in Fact Check
- Check your internet connection
- Verify your Groq API key is valid
- Make sure you have API credits/quota remaining

### AI Detection Not Working
- Verify both Sightengine API User and Secret are configured
- Check that you have remaining API quota on your Sightengine account
- Make sure the selected area is at least 10x10 pixels

### Screenshot Overlay Stuck
- Press the **Escape (ESC)** key to cancel and remove the overlay
- Reload the page if needed

## Privacy & Security Notes

- 🔒 API keys are stored locally in Chrome's sync storage
- 🔒 Text and images are sent to third-party APIs (Groq and Sightengine)
- 🔒 For production use, consider using a backend proxy instead of client-side API keys
- 📊 Check Groq and Sightengine's privacy policies for data handling

## API Pricing

### Groq
- Check current pricing at [console.groq.com](https://console.groq.com)
- Usually offers free tier with rate limits

### Sightengine
- Free tier: Limited API calls per month
- Paid plans available for higher volumes
- Check [sightengine.com/pricing](https://sightengine.com/pricing)

## Need Help?

- Check the [README.md](README.md) for technical details
- Review the code in `background.js`, `selection.js`, and `popup.js`
- Open an issue on GitHub if you encounter bugs
