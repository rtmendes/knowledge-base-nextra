# Genspark Share Link Extractor - Chrome Extension

## 🚀 Quick Install (5 minutes)

### Step 1: Load the Extension in Chrome

1. **Open Chrome** and go to: `chrome://extensions/`
2. **Enable "Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"** button
4. Select the folder: `genspark-extractor-extension`
5. The extension icon will appear in your toolbar (green circle)

### Step 2: Use the Extension

1. **Go to your Genspark history page**: https://www.genspark.ai/me
2. **Scroll down** to load ALL your chats (keep scrolling until you can't scroll anymore)
3. **(Optional) Enable Auto-Submit Prompt:**
   - Click the extension icon
   - Toggle ON "Auto-Submit Prompt"
   - Enter your custom prompt (e.g., "Summarize this conversation in 3 bullet points")
   - This prompt will be automatically submitted to EACH chat you visit
4. **Start clicking chats** - each one opens in a new tab
5. Watch the notifications:
   - **Green ✅** = "Public Enabled" (sharing enabled)
   - **Orange ⚠️** = "Captured Only" (just captured)
   - **Blue 🤖** = "Prompt Submitted" (your prompt was sent)
6. **Close the new tab** and click the next chat
7. Repeat for all chats

### Step 3: Download Your CSV

1. Click the **extension icon** (green circle in toolbar)
2. You'll see your progress: "Chats Captured: X/911"
3. When done, click **"📥 Download CSV"**
4. Done! You have all your share links!

---

## 🤖 Auto-Submit Prompt Feature (NEW!)

Want to automatically send a message to EVERY chat you visit? Enable auto-submit!

### 💡 Use Cases:
- Summarize all chats: *"Provide a 3-sentence summary"*
- Extract action items: *"List all action items and next steps"*
- Generate better titles: *"Suggest an improved title for this chat"*
- Tag conversations: *"What are the 3 main topics discussed?"*
- Any custom prompt you want!

### 📝 How to Use:
1. **Click extension icon**
2. **Toggle ON** "Auto-Submit Prompt" switch
3. **Type your prompt** in the text box (auto-saves)
4. **Start clicking chats** - prompt submits automatically to each one!

### 🎬 What Happens:
- Chat loads → Scrolls to bottom → Finds input box → Pastes prompt → Presses Enter
- You see: **🤖 "Prompt Submitted"** (blue notification)

### ⏸️ To Disable:
- Click extension icon → Toggle OFF

**Note**: The prompt will be sent as a NEW message in each chat, so Genspark will generate a response!

---

## 📊 Extension Features

- **Auto-capture**: Automatically detects and saves chat IDs as you browse
- **Auto-share**: Automatically enables "Anyone with the link" for each chat
- **Auto-submit prompt** (NEW!): Automatically paste and submit a custom prompt to each chat
- **Smart notifications**: 
  - ✅ Green = Public access enabled successfully
  - ⚠️ Orange = Captured but couldn't enable public access
  - 🤖 Blue = Prompt submitted automatically
- **Live counter**: Shows how many chats you've captured
- **Green badge**: Extension icon shows total count
- **No duplicates**: Won't capture the same chat twice
- **Persistent storage**: Data saved even if you close Chrome
- **One-click export**: Download all links as CSV instantly

---

## 💡 Tips for Faster Clicking

### Method 1: Middle-Click (Recommended)
- **Middle-click** (scroll wheel button) each chat
- Opens in new tab WITHOUT switching to it
- Much faster than regular clicking

### Method 2: Right-Click
- Right-click → "Open in new tab"
- Stay on the history page

### Method 3: Keyboard Shortcut
- Click chat
- Press `Ctrl+W` (Windows) or `Cmd+W` (Mac) to close the new tab immediately
- Click next chat

**Estimated time**: 
- With middle-clicking: ~15-30 minutes for 911 chats
- With regular clicking: ~45-60 minutes

---

## 🎯 What the Extension Does

1. **Monitors all Genspark pages** for chat URLs
2. **Extracts chat ID** from URL pattern: `/agents?id=CHAT_ID`
3. **Automatically clicks Share button** and enables "Anyone with the link"
4. **Saves to Chrome storage**:
   - Chat ID
   - Chat name
   - Share link (`https://www.genspark.ai/agents?id=CHAT_ID`)
   - Public access status (YES/UNKNOWN)
   - Timestamp
5. **Shows notification**:
   - ✅ Green = Public access enabled successfully
   - ⚠️ Orange = Captured but public access not confirmed
6. **Exports to CSV** with all data

**Important**: The share link IS the same as the chat URL. When you enable "Anyone with the link" in Genspark, that `/agents?id=` URL becomes publicly accessible.

---

## 📁 CSV Output Format

The downloaded CSV file contains:

```csv
Index,Chat ID,Chat Name,Share Link,Public Access,Captured At
1,"48df1c7d-1cf0-430e-93ac-1e38f6f2c0a7","YouTube Comment Scraping...","https://www.genspark.ai/agents?id=48df1c7d-1cf0-430e-93ac-1e38f6f2c0a7","YES","2024-12-24T10:30:45.123Z"
2,"a1b2c3d4-e5f6-7890-abcd-ef1234567890","Personal Knowledge Base...","https://www.genspark.ai/agents?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890","YES","2024-12-24T10:31:12.456Z"
...
```

**Public Access Column:**
- `YES` = Extension successfully enabled public sharing
- `UNKNOWN` = Extension couldn't confirm public access (you may need to enable manually)

---

## ⚠️ Troubleshooting

### Extension icon not showing?
- Check `chrome://extensions/` - make sure it's enabled
- Try reloading the extension (click refresh icon)

### Not capturing chats?
- Make sure you're on `https://www.genspark.ai/agents?id=...`
- Check browser console for errors (F12 → Console)
- Green notification should appear in top-right of page

### Lost your data?
- Data is stored in Chrome's local storage
- Survives browser restarts
- Only cleared if you click "Clear All Data" or uninstall extension

### Want to start over?
- Click extension icon
- Click "🗑️ Clear All Data"
- Confirm the prompt

---

## 🔧 Advanced: Checking Your Data

Open browser console (F12) and run:

```javascript
chrome.storage.local.get(['capturedChats'], (result) => {
    console.log('Captured chats:', result.capturedChats);
    console.table(result.capturedChats);
});
```

---

## 📝 Files in This Extension

- `manifest.json` - Extension configuration
- `background.js` - Handles data storage
- `content.js` - Captures chat IDs from pages
- `popup.html` - Extension popup UI
- `popup.js` - Popup functionality
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

---

## ✅ You're All Set!

The extension is ready to use. Just start clicking through your chats and it will automatically capture everything!

**Questions?** Check the browser console (F12) for any errors or messages.
