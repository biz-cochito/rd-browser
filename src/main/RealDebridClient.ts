import { BASE_URL } from "./config";

export interface RDResponse<T> {
    data: T;
    headers: Headers;
}

export class RealDebridClient {
    private apiToken: string;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    private async request<T>(
        method: string,
        path: string,
        options: any = {},
    ): Promise<RDResponse<T>> {
        const url = `${BASE_URL}${path}`;
        const headers = {
            Authorization: `Bearer ${this.apiToken}`,
            ...options.headers,
        };

        let response: Response | null = null;
        let lastError: any = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await fetch(url, {
                    method,
                    headers,
                    body: options.body,
                    ...options,
                });
                break; // If fetch succeeds, exit the retry loop
            } catch (error: any) {
                lastError = error;
                // Only retry on network errors, not HTTP errors
                if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET' || error.cause?.code === 'EAI_AGAIN') {
                    console.warn(`Network error during fetch (attempt ${attempt}/3):`, error.message);
                    if (attempt < 3) {
                        // Wait a short time before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                        continue;
                    }
                }
                throw error;
            }
        }

        if (!response) {
            throw lastError || new Error("Failed to fetch");
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
            return { data: null as any, headers: response.headers };
        }

        try {
            const data = await response.json();
            return { data, headers: response.headers };
        } catch (e) {
            return { data: null as any, headers: response.headers };
        }
    }

    async getMediaInfo(id: string): Promise<any> {
        const res = await this.request<any>(
            "GET",
            `/streaming/mediainfos/${id}`,
        );
        return res.data;
    }

    async unrestrictLink(link: string): Promise<any> {
        const params = new URLSearchParams();
        params.append("link", link);
        const res = await this.request<any>("POST", "/unrestrict/link", {
            body: params,
        });
        return res.data;
    }

    async getStreamLink(id: string): Promise<any> {
        const res = await this.request<any>(
            "GET",
            `/streaming/transcode/${id}`,
        );
        return res.data;
    }

    async addMagnet(magnetLink: string): Promise<any> {
        const params = new URLSearchParams();
        params.append("magnet", magnetLink);
        const res = await this.request<any>("POST", "/torrents/addMagnet", {
            body: params,
        });
        return res.data;
    }

    async addTorrentFile(fileBuffer: Buffer, fileName: string): Promise<any> {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)], {
            type: "application/x-bittorrent",
        });
        formData.append("file", blob, fileName);

        const res = await this.request<any>("PUT", "/torrents/addTorrent", {
            body: formData,
        });
        return res.data;
    }

    async getTorrentInfo(torrentId: string): Promise<any> {
        const res = await this.request<any>(
            "GET",
            `/torrents/info/${torrentId}`,
        );
        return res.data;
    }

    async selectFiles(torrentId: string, files: string = "all"): Promise<any> {
        const params = new URLSearchParams();
        params.append("files", files);
        const res = await this.request<any>(
            "POST",
            `/torrents/selectFiles/${torrentId}`,
            {
                body: params,
            },
        );
        return res.data;
    }

    async listTorrents(
        page: number = 1,
        limit?: number,
        status?: string,
    ): Promise<{ torrents: any[]; totalCount: number }> {
        const params = new URLSearchParams({ page: page.toString() });
        if (limit) params.append("limit", limit.toString());
        if (status) params.append("status", status);

        const res = await this.request<any[]>(
            "GET",
            `/torrents?${params.toString()}`,
        );
        return {
            torrents: res.data,
            totalCount: parseInt(res.headers.get("X-Total-Count") || "0"),
        };
    }
}
