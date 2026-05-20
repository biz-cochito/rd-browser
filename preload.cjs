const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rdApi", {
    getTorrents: (page, limit) => ipcRenderer.invoke("get-torrents", page, limit),
    getTorrentDetails: (torrentId) => ipcRenderer.invoke("get-torrent-details", torrentId),
    unrestrictLink: (link) => ipcRenderer.invoke("unrestrict-link", link),
    addMagnet: (magnet) => ipcRenderer.invoke("add-magnet", magnet),
    addTorrentFile: (filePath) => ipcRenderer.invoke("add-torrent-file", filePath),
    getStreamLink: (id) => ipcRenderer.invoke("get-stream-link", id),
    getMediaInfo: (id) => ipcRenderer.invoke("get-media-info", id),
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    playVideo: (url) => ipcRenderer.invoke("play-video", url),
});
