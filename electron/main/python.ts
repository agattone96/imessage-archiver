import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { log } from './index';

let pythonProcess: ChildProcess | null = null;

export function startPythonServer() {
    if (pythonProcess) {
        log('Python server already running');
        return;
    }

    const binName = process.platform === 'win32' ? 'archiver-backend.exe' : 'archiver-backend';
    const packagedBin = path.join(process.resourcesPath, 'backend', 'bin', binName);
    const bundledPython = path.join(process.resourcesPath, 'backend', 'venv', 'bin', 'python3');
    const devScript = path.join(app.getAppPath(), 'backend', 'src', 'app.py');
    const packagedScript = path.join(process.resourcesPath, 'backend', 'src', 'app.py');

    let cmd: string;
    let args: string[] = [];
    let cwd: string;

    if (app.isPackaged && fs.existsSync(packagedBin)) {
        cmd = packagedBin;
        cwd = path.dirname(packagedBin);
        log(`Starting backend binary: ${cmd}`);
    } else if (app.isPackaged && fs.existsSync(bundledPython)) {
        cmd = bundledPython;
        args = [packagedScript];
        cwd = path.dirname(packagedScript);
        log(`Starting backend with bundled Python: ${cmd} ${args.join(' ')}`);
    } else {
        cmd = 'python3';
        args = [devScript];
        cwd = path.dirname(devScript);
        log(`Starting backend with system Python: ${cmd} ${args.join(' ')}`);
    }

    pythonProcess = spawn(cmd, args, {
        cwd,
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    pythonProcess.stdout?.on('data', (data) => {
        log(`[Python] ${data.toString().trim()}`);
    });

    pythonProcess.stderr?.on('data', (data) => {
        log(`[Python Error] ${data.toString().trim()}`, 'ERROR');
    });

    pythonProcess.on('error', (err) => {
        log(`Failed to start backend: ${err}`, 'ERROR');
    });

    pythonProcess.on('close', (code) => {
        log(`Python process exited with code ${code}`);
        pythonProcess = null;
    });
}

export function killPythonServer() {
    if (pythonProcess) {
        log('Killing Python server...');
        pythonProcess.kill('SIGTERM');
        const pid = pythonProcess.pid;
        setTimeout(() => {
            try {
                if (pythonProcess && pid) {
                    pythonProcess.kill('SIGKILL');
                }
            } catch {
                // ignore
            }
        }, 3000);
        pythonProcess = null;
    }
}
