// Automatically generated file. Do not edit.
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('preloadAPI', {
    getTorrents: (page: number, limit: number) => ipcRenderer.invoke('getTorrents', page, limit),
    getTorrentDetails: (torrentId: string) => ipcRenderer.invoke('getTorrentDetails', torrentId),
    unrestrictLink: (link: string) => ipcRenderer.invoke('unrestrictLink', link),
    addMagnet: (magnet: string) => ipcRenderer.invoke('addMagnet', magnet),
    addTorrentFile: (filePath: string) => ipcRenderer.invoke('addTorrentFile', filePath),
    getStreamLink: (id: string) => ipcRenderer.invoke('getStreamLink', id),
    getMediaInfo: (id: string) => ipcRenderer.invoke('getMediaInfo', id),
    openExternal: (url: string) => ipcRenderer.invoke('openExternal', url),
    playVideo: (url: string) => ipcRenderer.invoke('playVideo', url),

});
