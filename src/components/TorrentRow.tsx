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
                <div class={`col-status ${torrent.status}`}>
                    <i class={`icon ${getStatusIcon(torrent.status)}`}></i>
                    <div class="col-progress">{torrent.progress}%</div>
                </div>
            </div>

            <div class="col-actions input-group">
                <button
                    onClick={() => onPlay(torrent.id)}
                    class="button play_circle tertiary"
                    title="Play"
                >
                    <i class="icon play_arrow"></i>
                </button>
                <button
                    onClick={() => onDownload(torrent.id)}
                    class="button"
                    title="Download"
                >
                    <i class="icon download"></i>
                </button>
                <button class="button" title="More">
                    <i class="icon more_vert"></i>
                </button>
            </div>
        </div>
    );
}
