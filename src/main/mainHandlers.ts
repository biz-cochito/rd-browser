// Automatically generated file. Do not edit.
import { ipcMain } from 'electron';
import { mainAPI } from './mainAPI';

export function registerHandlers() {
    ipcMain.handle('getTorrents', async (event, page, limit) => {
        return await mainAPI.getTorrents(page, limit);
    });
    ipcMain.handle('getTorrentDetails', async (event, torrentId) => {
        return await mainAPI.getTorrentDetails(torrentId);
    });
    ipcMain.handle('unrestrictLink', async (event, link) => {
        return await mainAPI.unrestrictLink(link);
    });
    ipcMain.handle('addMagnet', async (event, magnet) => {
        return await mainAPI.addMagnet(magnet);
    });
    ipcMain.handle('addTorrentFile', async (event, filePath) => {
        return await mainAPI.addTorrentFile(filePath);
    });
    ipcMain.handle('getStreamLink', async (event, id) => {
        return await mainAPI.getStreamLink(id);
    });
    ipcMain.handle('getMediaInfo', async (event, id) => {
        return await mainAPI.getMediaInfo(id);
    });
    ipcMain.handle('openExternal', async (event, url) => {
        return await mainAPI.openExternal(url);
    });
    ipcMain.handle('playVideo', async (event, url) => {
        return await mainAPI.playVideo(url);
    });
}
