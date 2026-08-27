import fs from "node:fs";
import path from "node:path";
import dns from "node:dns";
import dotenv from "dotenv";
import { RealDebridClient } from "./RealDebridClient";
import { handleMagnetLink, handleTorrentFile } from "./services";
import { API_TOKEN_ENV_VAR } from "./config";
import type {
    MediaInfo,
    StreamLink,
    TorrentInfo,
    TorrentListResult,
    UnrestrictedLink,
} from "../types/realDebrid";

dns.setDefaultResultOrder("ipv4first");
dotenv.config();

function assertHttpUrl(url: string) {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
    }
}

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

    // Get a list of torrents
    public async getTorrents(
        page: number,
        limit: number,
    ): Promise<TorrentListResult> {
        const client = this.validateClient();
        const validPage = Number(page) > 0 ? Number(page) : 1;
        const validLimit = Number(limit) > 0 ? Number(limit) : 30;
        return await client.listTorrents(validPage, validLimit);
    }

    // Get details for a specific torrent
    public async getTorrentDetails(torrentId: string): Promise<TorrentInfo> {
        const client = this.validateClient();
        return await client.getTorrentInfo(torrentId);
    }

    // Unrestrict a Real-Debrid link
    public async unrestrictLink(link: string): Promise<UnrestrictedLink> {
        const client = this.validateClient();
        return await client.unrestrictLink(link);
    }

    // Add a magnet link
    public async addMagnet(magnet: string): Promise<string[]> {
        const client = this.validateClient();
        return await handleMagnetLink(client, magnet);
    }

    // Add a torrent file
    public async addTorrentFile(filePath: string): Promise<string[]> {
        const client = this.validateClient();
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        return await handleTorrentFile(client, fileBuffer, fileName);
    }

    // Delete a torrent
    public async deleteTorrent(torrentId: string): Promise<void> {
        const client = this.validateClient();
        return await client.deleteTorrent(torrentId);
    }

    // Select files
    public async selectFiles(torrentId: string, files = "all"): Promise<void> {
        const client = this.validateClient();
        await client.selectFiles(torrentId, files);
    }

    // Get user info
    public async getUserInfo() {
        const client = this.validateClient();
        return await client.getUserInfo();
    }

    // Get a stream link for a file
    public async getStreamLink(id: string): Promise<StreamLink> {
        const client = this.validateClient();
        return await client.getStreamLink(id);
    }

    // Get media info for a file
    public async getMediaInfo(id: string): Promise<MediaInfo> {
        const client = this.validateClient();
        return await client.getMediaInfo(id);
    }

    // Open a URL in the default external browser
    public async openExternal(url: string): Promise<void> {
        assertHttpUrl(url);
    }

    // Play a video URL
    public async playVideo(url: string): Promise<boolean> {
        assertHttpUrl(url);
        return true;
    }

    // Get server-configured API token
    public getApiToken(): string | null {
        return process.env[API_TOKEN_ENV_VAR] || null;
    }

    // Save server API token to .env and memory
    public setApiToken(token: string): { success: boolean } {
        const cleanToken = token ? token.trim() : "";
        const envPath = path.resolve(process.cwd(), ".env");
        let content = "";
        if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, "utf-8");
        }
        if (content.includes(`${API_TOKEN_ENV_VAR}=`)) {
            content = content.replace(
                new RegExp(`${API_TOKEN_ENV_VAR}=.*`),
                `${API_TOKEN_ENV_VAR}=${cleanToken}`,
            );
        } else {
            content += `\n${API_TOKEN_ENV_VAR}=${cleanToken}\n`;
        }
        fs.writeFileSync(envPath, content.trim() + "\n");
        process.env[API_TOKEN_ENV_VAR] = cleanToken;

        if (cleanToken) {
            this.client = new RealDebridClient(cleanToken);
        } else {
            this.client = null;
        }

        return { success: true };
    }
}

export const mainAPI = new MainAPI();
