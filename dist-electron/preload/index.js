"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        // Whitelist channels
        let validChannels = ['toMain', 'complete-cleanup'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        let validChannels = ['fromMain', 'splash-progress', 'cleanup-complete'];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    invoke: async (channel, ...args) => {
        let validChannels = ['complete-cleanup'];
        if (validChannels.includes(channel)) {
            return await electron_1.ipcRenderer.invoke(channel, ...args);
        }
    }
});
//# sourceMappingURL=index.js.map