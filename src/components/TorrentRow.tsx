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
            <div class="input-group material-symbols">
                <div class={`col-status material-symbols ${torrent.status}`}>
                    {torrent.status ? "check" : "error"}
                    <div class="col-progress">{torrent.progress}%</div>
                </div>
            </div>

            <div class="col-actions input-group material-symbols">
                <button
                    onClick={() => onPlay(torrent.id)}
                    class="button play_circle tertiary"
                    title="Play"
                >
                    play_arrow
                </button>
                <button
                    onClick={() => onDownload(torrent.id)}
                    class="button"
                    title="Download"
                >
                    download
                </button>
                <button class="button" title="More">
                    more_vert
                </button>
            </div>
        </div>
    );
}
