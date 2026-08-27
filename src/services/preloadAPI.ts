import type {
    MediaInfo,
    StreamLink,
    TorrentInfo,
    TorrentListResult,
    UnrestrictedLink,
} from "../types/realDebrid";

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
    /** Test stored or input API token */
    testApiToken(token: string): Promise<{ id: number; username: string; email: string; points: number; type: string; expiration: string }>;
}

const TOKEN_STORAGE_KEY = "rd_api_token";

let serverTokenPromise: Promise<string | null> | null = null;

async function fetchServerToken(): Promise<string | null> {
    if (serverTokenPromise) return serverTokenPromise;
    serverTokenPromise = (async () => {
        try {
            const res = await fetch("/api/getApiToken", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                if (data.result) {
                    const token = String(data.result).trim();
                    if (token) {
                        localStorage.setItem(TOKEN_STORAGE_KEY, token);
                        return token;
                    }
                }
            }
        } catch (e) {
            console.warn("Could not fetch token from server:", e);
        }
        return null;
    })();
    return serverTokenPromise;
}

function initTokenFromUrl(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("api_token") || params.get("rd_token");
    if (token && token.trim()) {
        const cleanToken = token.trim();
        localStorage.setItem(TOKEN_STORAGE_KEY, cleanToken);
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
        return cleanToken;
    }
    return null;
}

async function callApi<T>(method: string, params: Record<string, unknown>): Promise<T> {
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
        const local = localStorage.getItem(TOKEN_STORAGE_KEY) || initTokenFromUrl();
        if (!local) {
            // Trigger background fetch from server if local storage is empty
            fetchServerToken();
        }
        return local;
    },
    setApiToken: (token: string): void => {
        const clean = token.trim();
        localStorage.setItem(TOKEN_STORAGE_KEY, clean);

        // Sync token with backend server for all LAN devices
        fetch("/api/setApiToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: clean }),
        }).catch((err) => console.warn("Failed to sync API token to server:", err));
    },
    testApiToken: (token: string): Promise<{ id: number; username: string; email: string; points: number; type: string; expiration: string }> => callApi("testApiToken", { token }),
};
