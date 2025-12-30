const { app, BrowserWindow, globalShortcut, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#050505',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false // Don't show until ready
  });

  // Load PersonalOS with JFDI design
  mainWindow.loadFile(path.join(__dirname, 'Dashboard', 'personalos.html'));

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Hide instead of close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  // Only create tray if icon exists
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show PersonalOS',
        click: () => {
          mainWindow.show();
        }
      },
      {
        label: 'Hide PersonalOS',
        click: () => {
          mainWindow.hide();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('PersonalOS');
    tray.setContextMenu(contextMenu);

    // Click tray to toggle window
    tray.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    });
  } else {
    console.log('Tray icon not found at', iconPath, '- skipping tray creation');
  }
}

function registerShortcuts() {
  // Global shortcut: Cmd+Shift+P to toggle window
  const ret = globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  if (!ret) {
    console.log('Shortcut registration failed');
  }
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when windows closed
  // This is different from typical apps but matches JFDI behavior
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// No IPC handlers needed - OpenCode web UI handles everything

console.log('PersonalOS app starting...');
