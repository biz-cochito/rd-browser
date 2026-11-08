import type { Torrent } from "@/types/torrent";
import { TorrentRow } from "./TorrentRow";
import {
  HardDrivesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
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
            className="h-24 w-full rounded-[12px] border border-hairline bg-surface-card p-4 animate-pulse"
          >
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-[8px] bg-canvas-soft border border-hairline-soft" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-24 rounded-full bg-surface-strong" />
                <div className="h-4 w-2/3 rounded-[4px] bg-canvas-soft" />
                <div className="h-3 w-40 rounded-[4px] bg-canvas-soft" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (torrents.length === 0) {
    return (
      <div className="my-4 flex flex-col items-center justify-center rounded-[12px] border border-hairline bg-surface-card px-6 py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-[8px] border border-hairline bg-canvas-soft text-ink">
          {searchQuery ? (
            <MagnifyingGlassIcon size={22} />
          ) : (
            <HardDrivesIcon size={22} />
          )}
        </div>
        <h3 className="typo-display-sm text-ink">
          {searchQuery ? "No matching torrents" : "No torrents in queue"}
        </h3>
        <p className="mt-1.5 max-w-md typo-body-sm text-body">
          {searchQuery
            ? `No items matched "${searchQuery}". Try clearing the filter or searching another hash.`
            : emptyMessage ||
              "Your Real-Debrid transfer index is empty. Add magnet links or torrent URLs to begin caching."}
        </p>
        {!searchQuery && (
          <Button onClick={onOpenAddModal} className="mt-6">
            <PlusIcon size={16} weight="bold" />
            <span>Add Magnet Links</span>
          </Button>
        )}
      </div>
    );
  }

  const readyCount = torrents.filter((t) => t.status === "downloaded").length;
  const activeCount = torrents.filter(
    (t) =>
      t.status === "downloading" ||
      t.status === "compressing" ||
      t.status === "uploading",
  ).length;

  return (
    <div className="space-y-3 my-3">
      {/* IDE-pane style status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-hairline bg-canvas-soft px-3.5 py-2 font-mono text-[12px] text-muted-text">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-semantic-success" />
          <span className="text-ink font-medium">
            {torrents.length} {torrents.length === 1 ? "item" : "items"}
          </span>
          <span>in current view</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            ready: <strong className="text-ink">{readyCount}</strong>
          </span>
          {activeCount > 0 && (
            <>
              <span className="text-hairline-strong">·</span>
              <span>
                active: <strong className="text-ink">{activeCount}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Torrent Rows */}
      <div className="space-y-3">
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
