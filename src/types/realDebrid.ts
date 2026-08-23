export interface RealDebridFile {
    id: number;
    path: string;
    bytes: number;
    selected: number;
}

export interface RealDebridTorrent {
    id: string;
    filename?: string;
    original_filename?: string;
    hash?: string;
    bytes?: number;
    original_bytes?: number;
    host?: string;
    split?: number;
    progress?: number;
    status?: string;
    added?: string;
    files?: RealDebridFile[];
    links?: string[];
    ended?: string;
    speed?: number;
    seeders?: number;
}

export interface TorrentListResult {
    torrents: RealDebridTorrent[];
    totalCount: number;
}

export interface TorrentInfo extends RealDebridTorrent {
    links: string[];
    files?: RealDebridFile[];
}

export interface UnrestrictedLink {
    id?: string;
    filename?: string;
    mimeType?: string;
    filesize?: number;
    link?: string;
    host?: string;
    chunks?: number;
    crc?: number;
    download?: string;
    streamable?: number;
}

export interface AddTorrentResult {
    id?: string;
    uri?: string;
}

export interface StreamLink {
    [key: string]: unknown;
}

export interface MediaInfo {
    [key: string]: unknown;
}
