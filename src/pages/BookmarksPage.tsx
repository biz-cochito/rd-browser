import { useMemo } from "react";
import { TorrentList } from "@/components/TorrentList";
import { useBookmarks, exportBookmarks } from "@/services/bookmarks";
import type { Torrent } from "@/types/torrent";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface BookmarksPageProps {
  searchQuery: string;
  showCompletedOnly: boolean;
  onPlay: (torrentId: string) => void;
  onShowDetails: (torrentId: string) => void;
  onDownload: (torrentId: string) => void;
  onDelete: (torrentId: string) => void;
  onCopyLink: (torrentId: string) => void;
  onOpenAddModal: () => void;
}

export function BookmarksPage({
  searchQuery,
  showCompletedOnly,
  onPlay,
  onShowDetails,
  onDownload,
  onDelete,
  onCopyLink,
  onOpenAddModal,
}: BookmarksPageProps) {
  const { bookmarks, bookmarkedIds, toggle } = useBookmarks();

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    if (showCompletedOnly) {
      result = result.filter((t) => t.status === "downloaded");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.filename?.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [bookmarks, searchQuery, showCompletedOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-5">
        <div className="space-y-1">
          <div className="typo-caption-uppercase text-muted-text">
            Saved Collection
          </div>
          <div className="flex items-center gap-3">
            <h1 className="typo-display-lg text-ink">Bookmarks</h1>
            <span className="badge-pill font-mono">
              {bookmarks.length} saved
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => exportBookmarks()}
          disabled={bookmarks.length === 0}
        >
          <DownloadSimpleIcon size={15} />
          <span>Export JSON</span>
        </Button>
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
        emptyMessage="No bookmarked torrents yet. Select the bookmark icon on any torrent row to pin it here."
      />
    </div>
  );
}
