import { BASE_URL } from "./config.js";

export class RealDebridClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
  }

  async request(method, path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: options.body,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Real-Debrid API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }

    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async unrestrictLink(link) {
    const params = new URLSearchParams();
    params.append("link", link);
    return this.request("POST", "/unrestrict/link", {
      body: params,
    });
  }

  async addMagnet(magnetLink) {
    const params = new URLSearchParams();
    params.append("magnet", magnetLink);
    return this.request("POST", "/torrents/addMagnet", {
      body: params,
    });
  }

  async addTorrentFile(fileBuffer, fileName) {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/x-bittorrent" });
    formData.append("file", blob, fileName);

    return this.request("PUT", "/torrents/addTorrent", {
      body: formData,
    });
  }

  async getTorrentInfo(torrentId) {
    return this.request("GET", `/torrents/info/${torrentId}`);
  }

  async selectFiles(torrentId, files = "all") {
    const params = new URLSearchParams();
    params.append("files", files);
    return this.request("POST", `/torrents/selectFiles/${torrentId}`, {
      body: params,
    });
  }

  async listTorrents(page = 1, limit, status) {
    const params = new URLSearchParams({ page });
    if (limit) params.append("limit", limit);
    if (status) params.append("status", status);
    
    return this.request("GET", `/torrents?${params.toString()}`);
  }
}
