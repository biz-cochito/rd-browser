import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "./config";
import { RealDebridClient } from "./RealDebridClient";

export async function waitForStatus(
    client: RealDebridClient,
    torrentId: string,
    expectedStatus: string,
) {
    const startTime = Date.now();

    while (Date.now() - startTime < POLL_TIMEOUT_MS) {
        const info = await client.getTorrentInfo(torrentId);
        const status = info.status;

        if (status === expectedStatus) {
            return info;
        }

        if (["error", "virus", "dead"].includes(status)) {
            throw new Error(`Torrent failed with status '${status}'.`);
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error(
        `Timed out waiting for torrent status '${expectedStatus}'.`,
    );
}

async function resolveTorrentDownloads(
    client: RealDebridClient,
    torrentId: string,
    sourceDescription: string,
) {
    if (!torrentId) {
        throw new Error(
            `Real-Debrid did not return a torrent id for ${sourceDescription}.`,
        );
    }

    await waitForStatus(client, torrentId, "waiting_files_selection");
    await client.selectFiles(torrentId, "all");

    const finalInfo = await waitForStatus(client, torrentId, "downloaded");
    const links: string[] = finalInfo.links || [];

    if (links.length === 0) {
        throw new Error(
            "Torrent completed but no downloadable links were returned.",
        );
    }

    const unrestrictedLinks = await Promise.all(
        links.map((link) => client.unrestrictLink(link)),
    );

    return unrestrictedLinks.map((link) => link.download);
}

export async function handleMagnetLink(
    client: RealDebridClient,
    magnetLink: string,
) {
    const result = await client.addMagnet(magnetLink);
    return resolveTorrentDownloads(client, result.id, "the magnet link");
}

export async function handleTorrentFile(
    client: RealDebridClient,
    fileBuffer: Buffer,
    fileName: string,
) {
    const result = await client.addTorrentFile(fileBuffer, fileName);
    return resolveTorrentDownloads(client, result.id, "the .torrent file");
}
