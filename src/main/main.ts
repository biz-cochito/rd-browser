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

    win.loadFile(path.join(__dirname, 'index.html'));
    
    // In dev mode, open dev tools
    if (process.env.NODE_ENV !== 'production') {
        // win.webContents.openDevTools();
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
