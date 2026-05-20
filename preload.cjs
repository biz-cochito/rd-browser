const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rdApi', {
    getTorrents: (page, limit) => ipcRenderer.invoke('get-torrents', page, limit),
    getTorrentDetails: (torrentId) => ipcRenderer.invoke('get-torrent-details', torrentId),
    unrestrictLink: (link) => ipcRenderer.invoke('unrestrict-link', link),
    addMagnet: (magnet) => ipcRenderer.invoke('add-magnet', magnet),
    addTorrentFile: (filePath) => ipcRenderer.invoke('add-torrent-file', filePath)
});
