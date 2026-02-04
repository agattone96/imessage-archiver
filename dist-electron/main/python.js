"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPythonServer = startPythonServer;
exports.killPythonServer = killPythonServer;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const index_1 = require("./index");
let pythonProcess = null;
function startPythonServer() {
    // In packaged app, python binary is in Resources/backend/venv/bin/python generally?
    // But referencing logic from logs: `python3 .../backend/src/app.py`
    // We assume backend/src/app.py exists relative to app path
    const scriptPath = path_1.default.join(process.resourcesPath, 'backend', 'src', 'app.py');
    const pythonCmd = 'python3'; // Simplification for now
    // Check if packaged
    let pythonScript = path_1.default.join(electron_1.app.getAppPath(), 'backend', 'src', 'app.py');
    if (electron_1.app.isPackaged) {
        pythonScript = path_1.default.join(process.resourcesPath, 'backend', 'src', 'app.py');
    }
    (0, index_1.log)(`Starting Python server: ${pythonScript}`);
    pythonProcess = (0, child_process_1.spawn)(pythonCmd, [pythonScript], {
        cwd: path_1.default.dirname(pythonScript),
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    pythonProcess.stdout?.on('data', (data) => {
        (0, index_1.log)(`[Python] ${data.toString().trim()}`);
    });
    pythonProcess.stderr?.on('data', (data) => {
        (0, index_1.log)(`[Python Error] ${data.toString().trim()}`, 'ERROR');
    });
    pythonProcess.on('close', (code) => {
        (0, index_1.log)(`Python process exited with code ${code}`);
    });
}
function killPythonServer() {
    if (pythonProcess) {
        (0, index_1.log)('Killing Python server...');
        pythonProcess.kill();
        pythonProcess = null;
    }
}
//# sourceMappingURL=python.js.map