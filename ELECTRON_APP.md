# PersonalOS Native Mac App

Your PersonalOS is now a native macOS application with a unified interface.

## What's Built

### Current Features
- **Native Mac App**: Electron-based desktop application
- **Unified Interface**: Dashboard + Chat in one window (no browser/terminal split)
- **Keyboard Shortcut**: `Cmd+Shift+P` to show/hide the app from anywhere
- **Submission Specialist Aesthetic**: Dark stealth theme matching your BJJ dashboard
- **Chat Interface**: Bottom panel with input and message history
- **Dashboard Area**: Top scrollable area for viewing your tasks/priority

### App Structure
```
PersonalOS/
├── main.js              # Electron main process (app lifecycle, shortcuts, IPC)
├── Dashboard/
│   └── app.html         # Unified interface (dashboard + chat)
├── package.json         # npm configuration
└── node_modules/        # Electron dependencies
```

## How to Use

### Start the App
```bash
cd ~/PersonalOS
npm start
```

The app window will open automatically.

### Keyboard Shortcut
Press `Cmd+Shift+P` from anywhere on your Mac to:
- Show the app if it's hidden
- Hide the app if it's visible
- Focus the app if it's in the background

### Close vs Hide
- Clicking the red X button **hides** the app (doesn't quit it)
- App stays running in the background
- Use `Cmd+Q` to actually quit the app

### Chat Interface
- Type in the bottom text area
- Press `Enter` to send (Shift+Enter for new line)
- Click "Send" button to submit
- Chat messages appear above with timestamps

## What's Next

### Need to Connect Claude Code Headless
The chat currently shows placeholder responses. Next step is to:
1. Start Claude Code in headless mode
2. Connect the IPC handler to Claude Code's API
3. Enable real AI conversations through the chat

### Optional: Add Tray Icon
To add a menu bar icon:
1. Create a 16x16 or 32x32 PNG icon
2. Save it to `assets/icon.png`
3. Restart the app
4. Icon will appear in menu bar for quick access

### Optional: Start Dashboard Server
The dashboard area currently shows static content. To load live data:
```bash
# In a separate terminal
dashboard
```

Then the dashboard will fetch real data from your PersonalOS files.

## Development

### Run with DevTools
Edit `main.js` line 41 and uncomment:
```javascript
mainWindow.webContents.openDevTools();
```

### Change Window Size
Edit `main.js` lines 9-10:
```javascript
width: 1200,  // Change width
height: 800,  // Change height
```

### Modify Chat Appearance
Edit `Dashboard/app.html` CSS variables (lines 17-29):
```css
:root {
  --bg-primary: #050505;        /* Main background */
  --accent-blue: #3b82f6;       /* User messages */
  --accent-purple: #8b5cf6;     /* Claude messages */
}
```

## Troubleshooting

### App Won't Start
Check Electron is installed:
```bash
npm list electron
```

If missing, reinstall:
```bash
npm install
```

### Keyboard Shortcut Not Working
- Close any other apps using `Cmd+Shift+P`
- Restart the PersonalOS app
- Check terminal for "Shortcut registration failed" message

### Chat Not Responding
This is expected - Claude Code headless connection not yet implemented.
The placeholder response confirms IPC communication is working.

---

**Status**: App structure complete, ready for Claude Code integration
**Built with**: Electron 39.2.7, Submission Specialist aesthetic
