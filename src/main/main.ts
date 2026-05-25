import { BrowserWindow, app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns';
import { registerHandlers } from './mainHandlers';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startApplication() {
    registerHandlers();

    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Note: esbuild will put it here
            contextIsolation: true,
            nodeIntegration: false
        },
        frame: false
    });

    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:5173");
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, "index.html"));
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
