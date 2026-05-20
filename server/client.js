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
      return { data: null, headers: response.headers };
    }

    try {
      const data = await response.json();
      return { data, headers: response.headers };
    } catch (e) {
      return { data: null, headers: response.headers };
    }
  }

  async unrestrictLink(link) {
    const params = new URLSearchParams();
    params.append("link", link);
    const res = await this.request("POST", "/unrestrict/link", {
      body: params,
    });
    return res.data;
  }

  async addMagnet(magnetLink) {
    const params = new URLSearchParams();
    params.append("magnet", magnetLink);
    const res = await this.request("POST", "/torrents/addMagnet", {
      body: params,
    });
    return res.data;
  }

  async addTorrentFile(fileBuffer, fileName) {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/x-bittorrent" });
    formData.append("file", blob, fileName);

    const res = await this.request("PUT", "/torrents/addTorrent", {
      body: formData,
    });
    return res.data;
  }

  async getTorrentInfo(torrentId) {
    const res = await this.request("GET", `/torrents/info/${torrentId}`);
    return res.data;
  }

  async selectFiles(torrentId, files = "all") {
    const params = new URLSearchParams();
    params.append("files", files);
    const res = await this.request("POST", `/torrents/selectFiles/${torrentId}`, {
      body: params,
    });
    return res.data;
  }

  async listTorrents(page = 1, limit, status) {
    const params = new URLSearchParams({ page });
    if (limit) params.append("limit", limit);
    if (status) params.append("status", status);
    
    const res = await this.request("GET", `/torrents?${params.toString()}`);
    return {
      torrents: res.data,
      totalCount: parseInt(res.headers.get("X-Total-Count") || "0"),
    };
  }
}
