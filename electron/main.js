const { app, BrowserWindow, Menu, shell } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

let mainWindow;
let splashWindow;
let streamlitProcess;
const STREAMLIT_PORT = 8501;

// Set app name for macOS branding
app.setName('Archiver');

// Windows: required for taskbar identity and notifications
if (process.platform === 'win32') {
  app.setAppUserModelId('com.antigravity.imessagearchiver');
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Setup diagnostic logging
const LOG_DIR = path.join(app.getPath('home'), 'Library', 'Logs', 'Archiver');
const LOG_FILE = path.join(LOG_DIR, `launch_${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

// Create log directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  // Write to file
  fs.appendFileSync(LOG_FILE, logMessage);

  // Also log to console (must use console.log, not log!)
  console.log(logMessage.trim());
}

log('='.repeat(60));
log('iMessage Archiver Launch Diagnostics');
log(`App Version: ${app.getVersion()}`);
log(`Electron Version: ${process.versions.electron}`);
log(`Node Version: ${process.versions.node}`);
log(`Platform: ${process.platform} ${process.arch}`);
log(`Log file: ${LOG_FILE}`);
log('='.repeat(60));

function createSplashScreen() {
  log('Creating splash screen');
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function getRuntimeIconPath() {
  const base = app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '..', 'build');

  if (process.platform === 'win32') {
    return path.join(base, 'icon.ico');
  }
  if (process.platform === 'linux') {
    return path.join(base, 'icons', '512x512.png');
  }
  if (process.platform === 'darwin') {
    return path.join(base, 'icon.icns');
  }
  return undefined;
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      server.once('close', () => {
        resolve(startPort);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(findFreePort(startPort + 1));
    });
  });
}

function findPython() {
  const { execSync } = require('child_process');

  // Try common Python 3 locations
  const pythonPaths = [
    path.join(app.getPath('home'), 'Library/Application Support/Archiver/.venv/bin/python3'),
    'python3',
    '/usr/bin/python3',
    '/usr/local/bin/python3',
    '/opt/homebrew/bin/python3',
    'python'
  ];

  for (const pythonCmd of pythonPaths) {
    try {
      const version = execSync(`${pythonCmd} --version 2>&1`, { encoding: 'utf-8' });
      if (version.includes('Python 3')) {
        log(`Found Python: ${pythonCmd} (${version.trim()})`);
        return pythonCmd;
      }
    } catch (e) {
      // Try next path
    }
  }

  // Last resort: use 'which' to find it
  try {
    const pythonPath = execSync('which python3', { encoding: 'utf-8' }).trim();
    if (pythonPath) {
      log(`Found Python via which: ${pythonPath}`);
      return pythonPath;
    }
  } catch (e) {
    // Fallback
  }

  throw new Error('Python 3 not found. Please install Python 3 from python.org');
}

function startStreamlit() {
  log('Starting Streamlit initialization');
  return new Promise(async (resolve, reject) => {
    const port = await findFreePort(STREAMLIT_PORT);
    log(`Found free port: ${port}`);

    let pythonPath;
    try {
      log('Searching for Python...');
      pythonPath = findPython();
      log(`Python resolved: ${pythonPath}`);
    } catch (error) {
      log(`ERROR: ${error.message}`, 'ERROR');
      reject(error);
      return;
    }

    // Determine if we're in production or development
    const isDev = !app.isPackaged;
    const scriptPath = isDev
      ? path.join(__dirname, '..', 'dashboard.py')
      : path.join(process.resourcesPath, 'dashboard.py');

    log(`Environment: ${isDev ? 'Development' : 'Production'}`);
    log(`Script path: ${scriptPath}`);
    log(`Checking if script exists: ${fs.existsSync(scriptPath)}`);
    if (!fs.existsSync(scriptPath)) {
      const error = `ERROR: dashboard.py not found at ${scriptPath}`;
      log(error, 'ERROR');
      log(`Resources path: ${process.resourcesPath}`);
      log(`Available files: ${fs.readdirSync(process.resourcesPath).join(', ')}`);
    }

    log(`Spawning Streamlit: ${pythonPath} on port ${port}`);

    streamlitProcess = spawn(pythonPath, [
      '-m', 'streamlit', 'run',
      scriptPath,
      '--server.port', port.toString(),
      '--server.headless', 'true',
      '--server.address', 'localhost',
      '--browser.serverAddress', 'localhost',
      '--global.developmentMode', 'false',
      '--server.runOnSave', 'false',
      '--client.toolbarMode', 'minimal',
      '--server.enableCORS', 'false',
      '--server.enableXsrfProtection', 'false'
    ], {
      env: {
        ...process.env,
        SCRIPT_DIR: isDev ? path.join(__dirname, '..') : process.resourcesPath
      }
    });

    streamlitProcess.stdout.on('data', (data) => {
      log(`Streamlit: ${data}`);
      if (data.toString().includes('Network URL') || data.toString().includes('Local URL')) {
        resolve(port);
      }
    });

    streamlitProcess.stderr.on('data', (data) => {
      log(`Streamlit Error: ${data}`);
    });

    streamlitProcess.on('close', (code) => {
      log(`Streamlit exited with code ${code}`);
    });

    // Timeout fallback
    setTimeout(() => resolve(port), 3000);
  });
}

function createWindow(port) {
  log(`Creating main window for port ${port}`);
  const runtimeIcon = getRuntimeIconPath();
  const isDev = !app.isPackaged;
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: (process.platform === 'win32' || process.platform === 'linux') ? runtimeIcon : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      devTools: isDev
    },
    title: 'Archiver',
    show: false
  });

  log(`Loading URL: http://localhost:${port}`);

  mainWindow.loadURL(`http://localhost:${port}`);

  const isAllowedLocalUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
        url.port === String(port)
      );
    } catch {
      return false;
    }
  };

  // Keep navigation confined to the local Streamlit app; open external links in the system browser.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedLocalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url).catch(() => {});
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedLocalUrl(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });

  // Wait for page content to actually load before showing
  mainWindow.webContents.on('did-finish-load', () => {
    log('Main window content loaded');
    // Small delay to let Streamlit render
    setTimeout(() => {
      log('Closing splash and showing main window');
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
      log('App fully initialized');
      log(`Full diagnostic log: ${LOG_FILE}`);
    }, 500);
  });

  mainWindow.on('closed', () => {
    log('Main window closed');
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  log('Electron app ready, starting initialization');

  // Force Menu Bar Title (macOS)
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'Archiver',
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
      { role: 'help' }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Force Dock Icon
    const iconPath = getRuntimeIconPath();
    log(`Attempting to set dock icon from: ${iconPath}`);
    if (iconPath && fs.existsSync(iconPath)) {
      app.dock.setIcon(iconPath);
      log('Dock icon set successfully');
    } else {
      log(`Dock icon NOT found at ${iconPath}`, 'WARNING');
    }
  }

  // Set a failure timeout - if app doesn't load in 30s, kill everything
  const failureTimeout = setTimeout(() => {
    log('TIMEOUT: App failed to load within 30 seconds', 'ERROR');
    log('Cleaning up processes and exiting...', 'ERROR');

    // Kill Streamlit if it exists
    if (streamlitProcess) {
      streamlitProcess.kill();
    }

    // Close all windows
    BrowserWindow.getAllWindows().forEach(win => win.close());

    // Quit app
    app.quit();
  }, 30000);

  try {
    // Show splash immediately
    createSplashScreen();

    // Start Streamlit in background
    const port = await startStreamlit();
    log(`Streamlit ready on port ${port}`);

    // Create main window (hidden initially)
    createWindow(port);

    // Clear the failure timeout since we made it this far
    clearTimeout(failureTimeout);
  } catch (error) {
    clearTimeout(failureTimeout);
    log(`FATAL ERROR: ${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (streamlitProcess) {
    streamlitProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(STREAMLIT_PORT);
  }
});
