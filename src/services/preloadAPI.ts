import type {
    MediaInfo,
    StreamLink,
    TorrentInfo,
    TorrentListResult,
    UnrestrictedLink,
} from "../types/realDebrid";
import { RealDebridClient } from "./RealDebridClient";
import { handleMagnetLink } from "./services";

export interface PreloadAPI {
    /** Get a list of torrents */
    getTorrents(page: number, limit: number): Promise<TorrentListResult>;
    /** Get details for a specific torrent */
    getTorrentDetails(torrentId: string): Promise<TorrentInfo>;
    /** Unrestrict a Real-Debrid link */
    unrestrictLink(link: string): Promise<UnrestrictedLink>;
    /** Add a magnet link */
    addMagnet(magnet: string): Promise<string[]>;
    /** Delete a torrent */
    deleteTorrent(torrentId: string): Promise<void>;
    /** Select files for a torrent */
    selectFiles(torrentId: string, files?: string): Promise<void>;
    /** Get a stream link for a file */
    getStreamLink(id: string): Promise<StreamLink>;
    /** Get media info for a file */
    getMediaInfo(id: string): Promise<MediaInfo>;
    /** Open a URL in the default external browser */
    openExternal(url: string): Promise<void>;
    /** Play a video URL */
    playVideo(url: string): Promise<boolean>;
    /** Get current Real-Debrid user info */
    getUserInfo(): Promise<{ id: number; username: string; email: string; points: number; type: string; expiration: string }>;
    /** Get stored API token */
    getApiToken(): string | null;
    /** Set stored API token */
    setApiToken(token: string): void;
}

const TOKEN_STORAGE_KEY = "rd_api_token";

let clientInstance: RealDebridClient | null = null;

function getClient(): RealDebridClient | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    if (!clientInstance || clientInstance.getToken() !== token) {
        clientInstance = new RealDebridClient(token);
    }
    return clientInstance;
}

async function callApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
    const client = getClient();
    if (client) {
        // Direct client execution in browser if token is configured
        switch (method) {
            case "getTorrents":
                return (await client.listTorrents(params.page as number, params.limit as number)) as T;
            case "getTorrentDetails":
                return (await client.getTorrentInfo(params.torrentId as string)) as T;
            case "unrestrictLink":
                return (await client.unrestrictLink(params.link as string)) as T;
            case "addMagnet":
                return (await handleMagnetLink(client, params.magnet as string)) as T;
            case "deleteTorrent":
                return (await client.deleteTorrent(params.torrentId as string)) as T;
            case "selectFiles":
                return (await client.selectFiles(params.torrentId as string, (params.files as string) || "all")) as T;
            case "getStreamLink":
                return (await client.getStreamLink(params.id as string)) as T;
            case "getMediaInfo":
                return (await client.getMediaInfo(params.id as string)) as T;
            case "getUserInfo":
                return (await client.getUserInfo()) as T;
            default:
                break;
        }
    }

    // Fallback to backend /api server endpoint if available
    const response = await fetch(`/api/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.result;
}

export const preloadAPI: PreloadAPI = {
    getTorrents: (page: number, limit: number): Promise<TorrentListResult> => callApi("getTorrents", { page, limit }),
    getTorrentDetails: (torrentId: string): Promise<TorrentInfo> => callApi("getTorrentDetails", { torrentId }),
    unrestrictLink: (link: string): Promise<UnrestrictedLink> => callApi("unrestrictLink", { link }),
    addMagnet: (magnet: string): Promise<string[]> => callApi("addMagnet", { magnet }),
    deleteTorrent: (torrentId: string): Promise<void> => callApi("deleteTorrent", { torrentId }),
    selectFiles: (torrentId: string, files = "all"): Promise<void> => callApi("selectFiles", { torrentId, files }),
    getStreamLink: (id: string): Promise<StreamLink> => callApi("getStreamLink", { id }),
    getMediaInfo: (id: string): Promise<MediaInfo> => callApi("getMediaInfo", { id }),
    getUserInfo: (): Promise<{ id: number; username: string; email: string; points: number; type: string; expiration: string }> => callApi("getUserInfo", {}),
    openExternal: async (url: string): Promise<void> => {
        window.open(url, "_blank", "noopener,noreferrer");
    },
    playVideo: async (): Promise<boolean> => {
        return true;
    },
    getApiToken: (): string | null => {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },
    setApiToken: (token: string): void => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
        if (token.trim()) {
            clientInstance = new RealDebridClient(token.trim());
        } else {
            clientInstance = null;
        }
    },
};
