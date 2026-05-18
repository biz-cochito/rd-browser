import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "./config.js";

export async function waitForStatus(client, torrentId, expectedStatus) {
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

  throw new Error(`Timed out waiting for torrent status '${expectedStatus}'.`);
}

export async function handleMagnetLink(client, magnetLink) {
  const result = await client.addMagnet(magnetLink);
  const torrentId = result.id;

  if (!torrentId) {
    throw new Error("Real-Debrid did not return a torrent id for the magnet link.");
  }

  await waitForStatus(client, torrentId, "waiting_files_selection");
  await client.selectFiles(torrentId, "all");
  
  const finalInfo = await waitForStatus(client, torrentId, "downloaded");
  const links = finalInfo.links || [];

  if (links.length === 0) {
    throw new Error("Torrent completed but no downloadable links were returned.");
  }

  const unrestrictedLinks = await Promise.all(
    links.map((link) => client.unrestrictLink(link))
  );

  return unrestrictedLinks.map((l) => l.download);
}

export async function handleTorrentFile(client, fileBuffer, fileName) {
  const result = await client.addTorrentFile(fileBuffer, fileName);
  const torrentId = result.id;

  if (!torrentId) {
    throw new Error("Real-Debrid did not return a torrent id for the .torrent file.");
  }

  await waitForStatus(client, torrentId, "waiting_files_selection");
  await client.selectFiles(torrentId, "all");
  
  const finalInfo = await waitForStatus(client, torrentId, "downloaded");
  const links = finalInfo.links || [];

  if (links.length === 0) {
    throw new Error("Torrent completed but no downloadable links were returned.");
  }

  const unrestrictedLinks = await Promise.all(
    links.map((link) => client.unrestrictLink(link))
  );

  return unrestrictedLinks.map((l) => l.download);
}
