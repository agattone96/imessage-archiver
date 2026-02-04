"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIPC = setupIPC;
const electron_1 = require("electron");
/**
 * Setup IPC handlers for communication between renderer (React) and main process.
 */
function setupIPC() {
    electron_1.ipcMain.handle('get-messages', async (event, chatGuid) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/chats/${chatGuid}/messages`);
            return await response.json();
        }
        catch (error) {
            console.error('IPC Error:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('get-chats', async (event, search) => {
        try {
            const url = search
                ? `http://127.0.0.1:8000/chats/recent?search=${encodeURIComponent(search)}`
                : 'http://127.0.0.1:8000/chats/recent';
            const response = await fetch(url);
            return await response.json();
        }
        catch (error) {
            console.error('IPC Error:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('archive-chat', async (event, chatGuid, format) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/chats/${chatGuid}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_guid: chatGuid, format, incremental: true })
            });
            return await response.json();
        }
        catch (error) {
            console.error('IPC Error:', error);
            throw error;
        }
    });
    // Complete app cleanup: export logs, zip them, wipe everything
    electron_1.ipcMain.handle('complete-cleanup', async () => {
        try {
            const { app, dialog } = require('electron');
            const fs = require('fs');
            const path = require('path');
            const { execSync } = require('child_process');
            const os = require('os');
            const { killPythonServer } = require('./python');
            // 1. Define paths
            const downloadsPath = app.getPath('downloads');
            const logsDir = path.join(app.getPath('home'), 'Library', 'Logs', 'Archiver');
            const appSupportDir = path.join(app.getPath('home'), 'Library', 'Application Support', 'Archiver');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipName = `archiver-logs-${timestamp}.zip`;
            const zipPath = path.join(downloadsPath, zipName);
            // 2. Export and zip logs
            if (fs.existsSync(logsDir)) {
                try {
                    execSync(`cd "${path.dirname(logsDir)}" && zip -r "${zipPath}" "${path.basename(logsDir)}"`, { encoding: 'utf-8' });
                    console.log(`Logs exported to: ${zipPath}`);
                }
                catch (zipError) {
                    console.error('Failed to zip logs:', zipError);
                }
            }
            // 3. Kill backend
            await killPythonServer();
            // 4. Remove all app data
            const pathsToRemove = [
                logsDir,
                appSupportDir,
                path.join(app.getPath('home'), 'Library', 'Caches', 'Archiver'),
                path.join(app.getPath('home'), 'Library', 'Preferences', 'com.archiver.app.plist')
            ];
            for (const removePath of pathsToRemove) {
                if (fs.existsSync(removePath)) {
                    try {
                        if (fs.lstatSync(removePath).isDirectory()) {
                            fs.rmSync(removePath, { recursive: true, force: true });
                        }
                        else {
                            fs.unlinkSync(removePath);
                        }
                        console.log(`Removed: ${removePath}`);
                    }
                    catch (removeError) {
                        console.error(`Failed to remove ${removePath}:`, removeError);
                    }
                }
            }
            // 5. Show success dialog and quit
            await dialog.showMessageBox({
                type: 'info',
                title: 'Cleanup Complete',
                message: 'App Cleaned Successfully',
                detail: `Logs exported to:\n${zipPath}\n\nAll app data has been removed.\n\nThe app will now quit.`,
                buttons: ['OK']
            });
            // 6. Quit app
            app.quit();
            return { success: true, zipPath };
        }
        catch (error) {
            console.error('Cleanup error:', error);
            return { success: false, error: error.message };
        }
    });
    console.log('[IPC] Handlers registered');
}
//# sourceMappingURL=ipc.js.map