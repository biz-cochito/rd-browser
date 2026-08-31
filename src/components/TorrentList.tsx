import type { Torrent } from "@/types/torrent";
import { TorrentRow } from "./TorrentRow";
import { HardDrivesIcon, PlusIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface TorrentListProps {
    torrents: Torrent[];
    loading: boolean;
    searchQuery: string;
    bookmarkedIds?: Set<string>;
    onToggleBookmark?: (torrent: Torrent) => void;
    onPlay: (torrentId: string) => void;
    onShowDetails: (torrentId: string) => void;
    onDownload: (torrentId: string) => void;
    onDelete: (torrentId: string) => void;
    onCopyLink: (torrentId: string) => void;
    onOpenAddModal: () => void;
    emptyMessage?: string;
}

export function TorrentList({
    torrents,
    loading,
    searchQuery,
    bookmarkedIds,
    onToggleBookmark,
    onPlay,
    onShowDetails,
    onDownload,
    onDelete,
    onCopyLink,
    onOpenAddModal,
    emptyMessage,
}: TorrentListProps) {
    if (loading && torrents.length === 0) {
        return (
            <div className="space-y-3 my-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="h-20 w-full rounded-xl bg-muted/50 border border-border animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (torrents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-2xl bg-card/50 my-4 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    {searchQuery ? <MagnifyingGlassIcon size={24} /> : <HardDrivesIcon size={24} />}
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-base">
                        {searchQuery ? "No matching torrents" : "No torrents found"}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        {searchQuery
                            ? `No torrents match "${searchQuery}". Try a different keyword.`
                            : emptyMessage || "Your Real-Debrid torrents list is empty. Add a magnet link to get started!"}
                    </p>
                </div>
                {!searchQuery && (
                    <Button onClick={onOpenAddModal} size="sm" className="mt-2">
                        <PlusIcon size={24} className="mr-1.5" weight="bold" />
                        Add Magnet Links
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 my-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                    Showing {torrents.length} torrent{torrents.length === 1 ? "" : "s"}
                </span>
            </div>

            <div className="space-y-2.5">
                {torrents.map((torrent) => (
                    <TorrentRow
                        key={torrent.id}
                        torrent={torrent}
                        isBookmarked={bookmarkedIds?.has(torrent.id)}
                        onToggleBookmark={onToggleBookmark}
                        onPlay={onPlay}
                        onShowDetails={onShowDetails}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onCopyLink={onCopyLink}
                    />
                ))}
            </div>
        </div>
    );
}
