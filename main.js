import { app, BrowserWindow, ipcMain, shell } from "electron";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { RealDebridClient } from "./server/client.js";
import { handleMagnetLink, handleTorrentFile } from "./server/services.js";
import { API_TOKEN_ENV_VAR } from "./server/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const apiToken = process.env[API_TOKEN_ENV_VAR];
let client = null;
if (apiToken) {
    client = new RealDebridClient(apiToken);
} else {
    console.warn(`WARNING: ${API_TOKEN_ENV_VAR} is not set in .env file!`);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.cjs"),
        },
    });

    win.loadFile(path.join(__dirname, "app/index.html"));
}

function validateClient() {
    if (!client) throw new Error("Real-Debrid API token is missing.");
}

app.whenReady().then(() => {
    // Register IPC Handlers
    ipcMain.handle("get-torrents", async (event, page, limit) => {
        validateClient();
        return await client.listTorrents(page, limit);
    });

    ipcMain.handle("get-torrent-details", async (event, torrentId) => {
        validateClient();
        return await client.getTorrentInfo(torrentId);
    });

    ipcMain.handle("unrestrict-link", async (event, link) => {
        validateClient();
        return await client.unrestrictLink(link);
    });

    ipcMain.handle("add-magnet", async (event, magnet) => {
        validateClient();
        return await handleMagnetLink(client, magnet);
    });

    ipcMain.handle("add-torrent-file", async (event, filePath) => {
        validateClient();
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        return await handleTorrentFile(client, fileBuffer, fileName);
    });

    ipcMain.handle("get-stream-link", async (event, id) => {
        validateClient();
        return await client.getStreamLink(id);
    });

    ipcMain.handle("get-media-info", async (event, id) => {
        validateClient();
        return await client.getMediaInfo(id);
    });

    ipcMain.handle("open-external", async (event, url) => {
        return await shell.openExternal(url);
    });

    ipcMain.handle("play-video", (event, url) => {
        spawn("mpv", [url], { detached: true, stdio: "ignore" }).unref();
        return true;
    });

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
