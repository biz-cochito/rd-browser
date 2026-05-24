"use strict";

// src/app/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("preloadAPI", {
  getTorrents: (page, limit) => import_electron.ipcRenderer.invoke("getTorrents", page, limit),
  getTorrentDetails: (torrentId) => import_electron.ipcRenderer.invoke("getTorrentDetails", torrentId),
  unrestrictLink: (link) => import_electron.ipcRenderer.invoke("unrestrictLink", link),
  addMagnet: (magnet) => import_electron.ipcRenderer.invoke("addMagnet", magnet),
  addTorrentFile: (filePath) => import_electron.ipcRenderer.invoke("addTorrentFile", filePath),
  getStreamLink: (id) => import_electron.ipcRenderer.invoke("getStreamLink", id),
  getMediaInfo: (id) => import_electron.ipcRenderer.invoke("getMediaInfo", id),
  openExternal: (url) => import_electron.ipcRenderer.invoke("openExternal", url),
  playVideo: (url) => import_electron.ipcRenderer.invoke("playVideo", url)
});
//# sourceMappingURL=preload.js.map
