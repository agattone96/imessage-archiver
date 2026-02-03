import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { app, BrowserWindow } from 'electron';
import { log as mainLog } from './index';

let backendProcess: ChildProcess | null = null;
const BACKEND_PORT = 8000;

function log(message: string, level = 'INFO') {
    mainLog(`[Python] ${message}`, level);
    console.log(`[Python] ${message}`);
}

function findPython(): string {
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
            const { execSync } = require('child_process');
            const version = execSync(`${pythonCmd} --version 2>&1`, { encoding: 'utf-8' });
            if (version.includes('Python 3')) {
                log(`Found Python: ${pythonCmd} (${version.trim()})`);
                return pythonCmd;
            }
        } catch { }
    }

    try {
        const { execSync } = require('child_process');
        const pythonPath = execSync('which python3', { encoding: 'utf-8' }).trim();
        if (pythonPath) {
            log(`Found Python via which: ${pythonPath}`);
            return pythonPath;
        }
    } catch { }

    throw new Error('Python 3 not found on system');
}

export function startPythonServer(splashWindow?: BrowserWindow | null): Promise<number> {
    log('Starting Backend initialization');
    splashWindow?.webContents.send('splash-progress', { message: 'Locating Python Environment...', percent: 10 });

    return new Promise((resolve, reject) => {
        let pythonPath;
        try {
            pythonPath = findPython();
            splashWindow?.webContents.send('splash-progress', { message: 'Python Environment Found', percent: 25 });
        } catch (error: any) {
            log(`ERROR: ${error.message}`, 'ERROR');
            reject(error);
            return;
        }

        const isDev = !app.isPackaged;
        const projectRoot = isDev ? path.join(__dirname, '../../') : process.resourcesPath;
        const scriptPath = path.join(projectRoot, 'backend', 'src', 'app.py');

        log(`Project root: ${projectRoot}`);
        log(`Script path: ${scriptPath}`);
        log(`Script exists: ${fs.existsSync(scriptPath)}`);

        if (!fs.existsSync(scriptPath)) {
            const error = `app.py not found at ${scriptPath}`;
            log(error, 'ERROR');
            reject(new Error(error));
            return;
        }

        splashWindow?.webContents.send('splash-progress', { message: 'Spawning Core Engine...', percent: 40 });

        log(`Spawning command: ${pythonPath} ${scriptPath}`);
        log(`CWD: ${projectRoot}`);

        backendProcess = spawn(pythonPath, [scriptPath], {
            cwd: projectRoot,
            env: {
                ...process.env,
                PYTHONUNBUFFERED: '1',
                PYTHONPATH: projectRoot
            }
        });

        if (!backendProcess || !backendProcess.pid) {
            const error = 'Failed to spawn backend process (no PID)';
            log(error, 'ERROR');
            reject(new Error(error));
            return;
        }

        log(`✓ Backend spawned with PID: ${backendProcess.pid}`);

        let backendReady = false;

        backendProcess.stdout?.on('data', (data) => {
            const output = data.toString().trim();
            log(`stdout: ${output}`);

            if (output.includes('Uvicorn running on') || output.includes('Application startup complete')) {
                backendReady = true;
                log('✓ Backend confirmed ready via stdout');
            }
        });

        backendProcess.stderr?.on('data', (data) => {
            const output = data.toString().trim();
            log(`stderr: ${output}`, 'WARNING');
        });

        backendProcess.on('error', (err) => {
            log(`Process spawn error: ${err.message}`, 'ERROR');
            reject(err);
        });

        backendProcess.on('close', (code, signal) => {
            log(`Backend exited with code ${code}, signal ${signal}`);
            backendProcess = null;
        });

        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            const progress = Math.min(40 + (attempts * 2), 90);
            splashWindow?.webContents.send('splash-progress', { message: 'Initializing Database...', percent: progress });

            const req = http.request({
                host: '127.0.0.1',
                port: BACKEND_PORT,
                path: '/system/status',
                method: 'GET',
                timeout: 1000
            }, (res) => {
                if (res.statusCode === 200) {
                    clearInterval(checkInterval);
                    log('✓ Health check passed: /system/status returned 200');
                    splashWindow?.webContents.send('splash-progress', { message: 'Ready!', percent: 100 });
                    resolve(BACKEND_PORT);
                } else {
                    log(`Health check returned status ${res.statusCode}`, 'WARNING');
                }
            });
            req.on('error', (err) => {
                // Silent until timeout - expected while backend starts
            });
            req.end();
        }, 500);

        setTimeout(() => {
            clearInterval(checkInterval);
            const diagnostics = [
                `Backend failed to start within 30s`,
                `Last known PID: ${backendProcess?.pid || 'none'}`,
                `Backend ready flag: ${backendReady}`,
                `Python path: ${pythonPath}`,
                `Script path: ${scriptPath}`,
                `Health endpoint: http://127.0.0.1:${BACKEND_PORT}/system/status`,
                `Check Terminal output or system logs for more details`
            ].join('\n');
            log(diagnostics, 'ERROR');
            reject(new Error('Backend initialization timed out'));
        }, 30000);
    });
}

export function killPythonServer() {
    if (backendProcess) {
        log(`Killing backend process (PID: ${backendProcess.pid})`);
        backendProcess.kill();
        backendProcess = null;
    }
}
