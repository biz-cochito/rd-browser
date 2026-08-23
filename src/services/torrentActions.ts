import type { PreloadAPI } from "./preloadAPI";

type TorrentLinkAPI = Pick<PreloadAPI, "getTorrentDetails" | "unrestrictLink">;
type AddMagnetAPI = Pick<PreloadAPI, "addMagnet">;

export async function getFirstDownloadUrl(
    api: TorrentLinkAPI,
    torrentId: string,
) {
    const details = await api.getTorrentDetails(torrentId);

    if (!details.links?.length) {
        throw new Error("This torrent has no downloadable links.");
    }

    const unrestricted = await api.unrestrictLink(details.links[0]);

    if (!unrestricted.download) {
        throw new Error("Failed to get a direct download link from Real-Debrid.");
    }

    return unrestricted.download;
}

export async function addMagnetLinks(api: AddMagnetAPI, text: string) {
    const magnets = text
        .split(/\s+/)
        .map((link) => link.trim())
        .filter((link) => link.startsWith("magnet:"));

    if (magnets.length === 0) {
        throw new Error("Paste at least one magnet link.");
    }

    for (const magnet of magnets) {
        await api.addMagnet(magnet);
    }

    return { addedCount: magnets.length };
}
