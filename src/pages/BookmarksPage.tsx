import { useMemo } from "react";
import { TorrentList } from "@/components/TorrentList";
import { useBookmarks } from "@/services/bookmarks";
import type { Torrent } from "@/types/torrent";
import { BookmarkIcon } from "@phosphor-icons/react";

interface BookmarksPageProps {
    searchQuery: string;
    onPlay: (torrentId: string) => void;
    onShowDetails: (torrentId: string) => void;
    onDownload: (torrentId: string) => void;
    onDelete: (torrentId: string) => void;
    onCopyLink: (torrentId: string) => void;
    onOpenAddModal: () => void;
}

export function BookmarksPage({
    searchQuery,
    onPlay,
    onShowDetails,
    onDownload,
    onDelete,
    onCopyLink,
    onOpenAddModal,
}: BookmarksPageProps) {
    const { bookmarks, bookmarkedIds, toggle } = useBookmarks();

    const filteredBookmarks = useMemo(() => {
        if (!searchQuery.trim()) return bookmarks;
        const q = searchQuery.toLowerCase();
        return bookmarks.filter(
            (t) => t.filename?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
        );
    }, [bookmarks, searchQuery]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 font-semibold text-lg">
                    <BookmarkIcon size={22} weight="fill" className="text-violet-300" />
                    <h2>Bookmarked Torrents</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                    {bookmarks.length} saved item{bookmarks.length === 1 ? "" : "s"}
                </span>
            </div>

            <TorrentList
                torrents={filteredBookmarks}
                loading={false}
                searchQuery={searchQuery}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={(torrent: Torrent) => toggle(torrent)}
                onPlay={onPlay}
                onShowDetails={onShowDetails}
                onDownload={onDownload}
                onDelete={onDelete}
                onCopyLink={onCopyLink}
                onOpenAddModal={onOpenAddModal}
                emptyMessage="No bookmarked torrents yet. Click the bookmark icon on any torrent row to save it here for quick access!"
            />
        </div>
    );
}
