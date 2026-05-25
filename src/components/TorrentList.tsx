import type { Torrent } from "@models/torrent";
import { TorrentRow } from "./TorrentRow";

interface TorrentListProps {
    torrents: Torrent[];
    onPlay: (torrentId: string) => void;
    onDownload: (torrentId: string) => void;
}

export function TorrentList({
    torrents,
    onPlay,
    onDownload,
}: TorrentListProps) {
    return (
        <div class="torrent-list w-full">
            <div class="torrent-row torrent-header">
                <div class="col-name">Name</div>
                <div class="col-status input-group">
                    <div class="col-status">Status</div>
                    <div class="col-progress"></div>
                </div>
                <div class="col-actions">Actions</div>
            </div>

            {torrents.map((torrent) => (
                <TorrentRow
                    key={torrent.id}
                    torrent={torrent}
                    onPlay={onPlay}
                    onDownload={onDownload}
                />
            ))}
        </div>
    );
}
