import type { Torrent } from "@models/torrent";

interface TorrentRowProps {
    torrent: Torrent;
    onPlay: (torrentId: string) => void;
    onDownload: (torrentId: string) => void;
}

function getStatusIcon(status?: string) {
    if (status === "downloaded") return "check";
    if (status === "error") return "error";
    return "sync";
}

export function TorrentRow({ torrent, onPlay, onDownload }: TorrentRowProps) {
    return (
        <div class="torrent-row">
            <div
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "pre-wrap",
                }}
                class="col-name file-title"
            >
                <span id="file-title">{torrent.filename}</span>
            </div>
            <div class="input-group">
                <div class={`material-symbols col-status ${torrent.status}`}>
                    {getStatusIcon(torrent.status)}
                    <div class="col-progress">{torrent.progress}%</div>
                </div>
            </div>

            <div class="col-actions input-group">
                <button
                    onClick={() => onPlay(torrent.id)}
                    class="material-symbols button play_circle tertiary"
                >
                    play_arrow
                </button>
                <button
                    onClick={() => onDownload(torrent.id)}
                    class="material-symbols button"
                >
                    download
                </button>
                <button class="material-symbols button">more_vert</button>
            </div>
        </div>
    );
}
