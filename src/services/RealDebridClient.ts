import { BASE_URL } from "./config";
import type {
    AddTorrentResult,
    MediaInfo,
    StreamLink,
    TorrentInfo,
    TorrentListResult,
    UnrestrictedLink,
} from "../types/realDebrid";

export interface RDResponse<T> {
    data: T;
    headers: Headers;
}

const DEFAULT_CLIENT_ID = "X245A4XAIBGVM";

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    interval: number;
    expires_in: number;
    verification_url: string;
    direct_verification_url?: string;
}

export interface DeviceCredentialsResponse {
    client_id: string;
    client_secret: string;
}

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string;
}

export class RealDebridClient {
    private apiToken: string;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    public setToken(apiToken: string) {
        this.apiToken = apiToken;
    }

    public getToken(): string {
        return this.apiToken;
    }

    private async request<T>(
        method: string,
        path: string,
        options: RequestInit = {},
    ): Promise<RDResponse<T>> {
        const delimiter = path.includes("?") ? "&" : "?";
        const url = `${BASE_URL}${path}${delimiter}auth_token=${encodeURIComponent(this.apiToken)}`;
        const headers = {
            Authorization: `Bearer ${this.apiToken}`,
            ...options.headers,
        };

        let response: Response | null = null;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await fetch(url, {
                    method,
                    headers,
                    body: options.body,
                    ...options,
                });
                break;
            } catch (error) {
                lastError = error;
                const cause = error instanceof Error ? error.cause : undefined;
                const causeCode =
                    cause && typeof cause === "object" && "code" in cause
                        ? (cause as { code?: string }).code
                        : undefined;
                const errorCode =
                    error && typeof error === "object" && "code" in error
                        ? (error as { code?: string }).code
                        : undefined;

                if (
                    errorCode === "EAI_AGAIN" ||
                    errorCode === "ENOTFOUND" ||
                    errorCode === "ECONNRESET" ||
                    causeCode === "EAI_AGAIN"
                ) {
                    console.warn(
                        `Network error during fetch (attempt ${attempt}/3):`,
                        error instanceof Error ? error.message : String(error),
                    );
                    if (attempt < 3) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 1000 * attempt),
                        );
                        continue;
                    }
                }
                throw error;
            }
        }

        if (!response) {
            throw lastError instanceof Error ? lastError : new Error("Failed to fetch");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Real-Debrid API error: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        if (
            response.status === 204 ||
            response.headers.get("content-length") === "0"
        ) {
            return { data: null as T, headers: response.headers };
        }

        try {
            const data = (await response.json()) as T;
            return { data, headers: response.headers };
        } catch {
            return { data: null as T, headers: response.headers };
        }
    }

    async getMediaInfo(id: string): Promise<MediaInfo> {
        const res = await this.request<MediaInfo>(
            "GET",
            `/streaming/mediainfos/${id}`,
        );
        return res.data;
    }

    async unrestrictLink(link: string): Promise<UnrestrictedLink> {
        const params = new URLSearchParams();
        params.append("link", link);
        const res = await this.request<UnrestrictedLink>("POST", "/unrestrict/link", {
            body: params,
        });
        return res.data;
    }

    async getStreamLink(id: string): Promise<StreamLink> {
        const res = await this.request<StreamLink>(
            "GET",
            `/streaming/transcode/${id}`,
        );
        return res.data;
    }

    async addMagnet(magnetLink: string): Promise<AddTorrentResult> {
        const params = new URLSearchParams();
        params.append("magnet", magnetLink);
        const res = await this.request<AddTorrentResult>("POST", "/torrents/addMagnet", {
            body: params,
        });
        return res.data;
    }

    async addTorrentFile(
        fileBuffer: Buffer | ArrayBuffer,
        fileName: string,
    ): Promise<AddTorrentResult> {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)], {
            type: "application/x-bittorrent",
        });
        formData.append("file", blob, fileName);

        const res = await this.request<AddTorrentResult>("PUT", "/torrents/addTorrent", {
            body: formData,
        });
        return res.data;
    }

    async getTorrentInfo(torrentId: string): Promise<TorrentInfo> {
        const res = await this.request<TorrentInfo>(
            "GET",
            `/torrents/info/${torrentId}`,
        );
        return res.data;
    }

    async selectFiles(
        torrentId: string,
        files: string = "all",
    ): Promise<AddTorrentResult> {
        const params = new URLSearchParams();
        params.append("files", files);
        const res = await this.request<AddTorrentResult>(
            "POST",
            `/torrents/selectFiles/${torrentId}`,
            {
                body: params,
            },
        );
        return res.data;
    }

    async deleteTorrent(torrentId: string): Promise<void> {
        await this.request<null>("DELETE", `/torrents/delete/${torrentId}`);
    }

    async listTorrents(
        page: number = 1,
        limit?: number,
        status?: string,
    ): Promise<TorrentListResult> {
        const params = new URLSearchParams({ page: page.toString() });
        if (limit) params.append("limit", limit.toString());
        if (status) params.append("status", status);

        const res = await this.request<TorrentInfo[]>(
            "GET",
            `/torrents?${params.toString()}`,
        );
        return {
            torrents: res.data || [],
            totalCount: parseInt(res.headers.get("X-Total-Count") || "0", 10),
        };
    }

    async getUserInfo(): Promise<{ id: number; username: string; email: string; points: number; type: string; expiration: string }> {
        const res = await this.request<{ id: number; username: string; email: string; points: number; type: string; expiration: string }>("GET", "/user");
        return res.data;
    }

    static async getDeviceCode(clientId = DEFAULT_CLIENT_ID): Promise<DeviceCodeResponse> {
        const url = `${BASE_URL}/oauth/v2/device/code?client_id=${clientId}&new_credentials=yes`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to get device code: ${res.statusText}`);
        }
        return (await res.json()) as DeviceCodeResponse;
    }

    static async pollDeviceCredentials(
        deviceCode: string,
        clientId = DEFAULT_CLIENT_ID,
    ): Promise<DeviceCredentialsResponse | null> {
        const url = `${BASE_URL}/oauth/v2/device/credentials?client_id=${clientId}&code=${deviceCode}`;
        const res = await fetch(url);
        if (res.status === 404 || res.status === 400) {
            return null;
        }
        if (!res.ok) {
            throw new Error(`Error polling device credentials: ${res.statusText}`);
        }
        return (await res.json()) as DeviceCredentialsResponse;
    }

    static async getTokenFromCredentials(
        clientId: string,
        clientSecret: string,
        deviceCode: string,
    ): Promise<TokenResponse> {
        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);
        params.append("code", deviceCode);
        params.append("grant_type", "http://oauth.net/grant_type/device/1.0");

        const res = await fetch(`${BASE_URL}/oauth/v2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        if (!res.ok) {
            throw new Error(`Failed to exchange token: ${res.statusText}`);
        }

        return (await res.json()) as TokenResponse;
    }
}
