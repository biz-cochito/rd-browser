// Automatically generated file. Do not edit.
export interface PreloadAPI {
    /** Get a list of torrents */
    getTorrents(page: number, limit: number): Promise<{ torrents: any[], totalCount: number }>;
    /** Get details for a specific torrent */
    getTorrentDetails(torrentId: string): Promise<any>;
    /** Unrestrict a Real-Debrid link */
    unrestrictLink(link: string): Promise<any>;
    /** Add a magnet link */
    addMagnet(magnet: string): Promise<any>;
    /** Add a torrent file */
    addTorrentFile(filePath: string): Promise<any>;
    /** Get a stream link for a file */
    getStreamLink(id: string): Promise<any>;
    /** Get media info for a file */
    getMediaInfo(id: string): Promise<any>;
    /** Open a URL in the default external browser */
    openExternal(url: string): Promise<void>;
    /** Play a video URL using mpv */
    playVideo(url: string): Promise<boolean>;

}

declare global {
    interface Window {
        preloadAPI: PreloadAPI;
    }
}

export const preloadAPI = window.preloadAPI;
