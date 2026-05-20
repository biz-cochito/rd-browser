import { shell } from "electron";

export function playVideo(id) {
    const streamLink = getStreamLink(id);
    if (streamLink) {
        shell.openExternal(streamLink);
    }
}
