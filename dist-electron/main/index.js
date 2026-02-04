"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const python_1 = require("./python");
const ipc_1 = require("./ipc");
let mainWindow = null;
let splashWindow = null;
const FRONTEND_PORT = 5173;
electron_1.app.setName('Archiver');
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
}
const LOG_DIR = path_1.default.join(electron_1.app.getPath('home'), 'Library', 'Logs', 'Archiver');
const LOG_FILE = path_1.default.join(LOG_DIR, `launch_${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
if (!fs_1.default.existsSync(LOG_DIR)) {
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
}
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    fs_1.default.appendFileSync(LOG_FILE, logMessage);
    console.log(logMessage.trim());
}
log('='.repeat(60));
log('iMessage Archiver Launch Diagnostics');
log(`App Version: ${electron_1.app.getVersion()}`);
log(`Electron Version: ${process.versions.electron}`);
log(`Node Version: ${process.versions.node}`);
log(`Platform: ${process.platform} ${process.arch}`);
log(`Packaged: ${electron_1.app.isPackaged}`);
log(`Log file: ${LOG_FILE}`);
log('='.repeat(60));
function getRuntimeIconPath() {
    if (process.platform === 'darwin') {
        if (electron_1.app.isPackaged) {
            return path_1.default.join(process.resourcesPath, 'assets', 'icons', 'app-icon.icns');
        }
        return path_1.default.join(__dirname, '../../assets/icons/app-icon.png');
    }
    return '';
}
function createSplashWindow() {
    const iconPath = getRuntimeIconPath();
    splashWindow = new electron_1.BrowserWindow({
        width: 300,
        height: 350,
        backgroundColor: '#05060b',
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        show: false,
        title: 'Archiver',
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    splashWindow.loadFile(electron_1.app.isPackaged
        ? path_1.default.join(process.resourcesPath, 'electron/splash.html')
        : path_1.default.join(__dirname, '../splash.html'));
    splashWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.show();
        }
    });
    splashWindow.on('closed', () => {
        splashWindow = null;
    });
}
function createWindow() {
    log('Creating main window');
    const runtimeIcon = getRuntimeIconPath();
    const isDev = !electron_1.app.isPackaged;
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#05060b',
        icon: runtimeIcon,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, '../preload/index.js')
        },
        title: 'Archiver',
        show: false
    });
    const loadUrl = isDev
        ? `http://localhost:${FRONTEND_PORT}`
        : `file://${path_1.default.join(electron_1.app.getAppPath(), 'frontend/dist/index.html')}`;
    log(`Loading URL: ${loadUrl}`);
    mainWindow.loadURL(loadUrl);
    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log(`Failed to load: ${errorDescription} (${errorCode})`, 'ERROR');
    });
}
electron_1.app.whenReady().then(async () => {
    log('App ready');
    (0, ipc_1.setupIPC)();
    createSplashWindow();
    // Start backend
    try {
        (0, python_1.startPythonServer)();
    }
    catch (e) {
        log(`Failed to start backend: ${e}`, 'ERROR');
    }
    // Wait for splash or directly create window if dev (actually we simulate splash)
    setTimeout(() => {
        createWindow();
    }, 2000);
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    log('App quitting...');
    (0, python_1.killPythonServer)();
});
//# sourceMappingURL=index.js.map