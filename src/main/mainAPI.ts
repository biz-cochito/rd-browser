import { shell } from "electron";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { RealDebridClient } from "./RealDebridClient";
import { handleMagnetLink, handleTorrentFile } from "./services";
import { API_TOKEN_ENV_VAR } from "./config";

dotenv.config();

export class MainAPI {
    private client: RealDebridClient | null = null;

    constructor() {
        const apiToken = process.env[API_TOKEN_ENV_VAR];
        if (apiToken) {
            this.client = new RealDebridClient(apiToken);
        } else {
            console.warn(
                `WARNING: ${API_TOKEN_ENV_VAR} is not set in .env file!`,
            );
        }
    }

    private validateClient() {
        if (!this.client) throw new Error("Real-Debrid API token is missing.");
        return this.client;
    }

    // Safe API: Get a list of torrents
    public async getTorrents(
        page: number,
        limit: number,
    ): Promise<{ torrents: any[]; totalCount: number }> {
        const client = this.validateClient();
        return await client.listTorrents(page, limit);
    }

    // Safe API: Get details for a specific torrent
    public async getTorrentDetails(torrentId: string): Promise<any> {
        const client = this.validateClient();
        return await client.getTorrentInfo(torrentId);
    }

    // Safe API: Unrestrict a Real-Debrid link
    public async unrestrictLink(link: string): Promise<any> {
        const client = this.validateClient();
        return await client.unrestrictLink(link);
    }

    // Safe API: Add a magnet link
    public async addMagnet(magnet: string): Promise<any> {
        const client = this.validateClient();
        return await handleMagnetLink(client, magnet);
    }

    // Safe API: Add a torrent file
    public async addTorrentFile(filePath: string): Promise<any> {
        const client = this.validateClient();
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        return await handleTorrentFile(client, fileBuffer, fileName);
    }

    // Safe API: Get a stream link for a file
    public async getStreamLink(id: string): Promise<any> {
        const client = this.validateClient();
        return await client.getStreamLink(id);
    }

    // Safe API: Get media info for a file
    public async getMediaInfo(id: string): Promise<any> {
        const client = this.validateClient();
        return await client.getMediaInfo(id);
    }

    // Safe API: Open a URL in the default external browser
    public async openExternal(url: string): Promise<void> {
        await shell.openExternal(url);
    }

    // Safe API: Play a video URL using mpv
    public async playVideo(url: string): Promise<boolean> {
        spawn("mpv", [url], { detached: true, stdio: "ignore" }).unref();
        return true;
    }
}

export const mainAPI = new MainAPI();
