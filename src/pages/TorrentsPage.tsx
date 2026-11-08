import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { TorrentList } from "@/components/TorrentList";
import { Pagination } from "@/components/Pagination";
import { DeviceAuthCard } from "@/components/DeviceAuthCard";
import { preloadAPI } from "@/services/preloadAPI";
import { useBookmarks } from "@/services/bookmarks";
import type { Torrent } from "@/types/torrent";
import { KeyIcon, GearIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export interface TorrentsPageRef {
  refresh: () => void;
}

interface TorrentsPageProps {
  searchQuery: string;
  showCompletedOnly: boolean;
  hasApiToken: boolean;
  onLoadingChange: (loading: boolean) => void;
  showToast: (message: string, type?: "success" | "error") => void;
  onPlay: (torrentId: string) => void;
  onShowDetails: (torrentId: string) => void;
  onDownload: (torrentId: string) => void;
  onDelete: (torrentId: string) => void;
  onCopyLink: (torrentId: string) => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
}

export const TorrentsPage = forwardRef<TorrentsPageRef, TorrentsPageProps>(
  (
    {
      searchQuery,
      showCompletedOnly,
      hasApiToken,
      onLoadingChange,
      showToast,
      onPlay,
      onShowDetails,
      onDownload,
      onDelete,
      onCopyLink,
      onOpenAddModal,
      onOpenSettingsModal,
    },
    ref,
  ) => {
    const ITEMS_PER_PAGE = 30;
    const ITEMS_PER_RD_FETCH = 100;

    const [allTorrents, setAllTorrents] = useState<Torrent[]>([]);
    const [rdPage, setRdPage] = useState(1);
    const [hasMoreRd, setHasMoreRd] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const { bookmarkedIds, toggle } = useBookmarks();

    const getFilteredCount = useCallback(
      (torrents: Torrent[]) => {
        let result = torrents;
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
        return result.length;
      },
      [showCompletedOnly, searchQuery],
    );

    const loadUntilPage = useCallback(
      async (targetUiPage: number, forceRefresh = false) => {
        setLoading(true);
        onLoadingChange(true);
        try {
          let currentAll = allTorrents;
          let currentRdPage = rdPage;
          let currentHasMore = hasMoreRd;

          if (forceRefresh) {
            currentAll = [];
            currentRdPage = 1;
            currentHasMore = true;
          }

          const targetValidCount = targetUiPage * ITEMS_PER_PAGE;
          let activeFilteredCount = getFilteredCount(currentAll);

          while (currentHasMore && activeFilteredCount < targetValidCount) {
            const result = await preloadAPI.getTorrents(
              currentRdPage,
              ITEMS_PER_RD_FETCH,
            );
            const newTorrents = result.torrents || [];

            if (newTorrents.length === 0) {
              currentHasMore = false;
              break;
            }

            currentAll = [...currentAll, ...newTorrents];
            activeFilteredCount = getFilteredCount(currentAll);
            currentRdPage++;

            if (newTorrents.length < ITEMS_PER_RD_FETCH) {
              currentHasMore = false;
              break;
            }
          }

          setAllTorrents(currentAll);
          setRdPage(currentRdPage);
          setHasMoreRd(currentHasMore);
        } catch (error) {
          console.error("Failed to load torrents:", error);
          showToast(
            error instanceof Error ? error.message : "Failed to load torrents.",
            "error",
          );
        } finally {
          setLoading(false);
          onLoadingChange(false);
        }
      },
      [
        allTorrents,
        rdPage,
        hasMoreRd,
        getFilteredCount,
        onLoadingChange,
        showToast,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => loadUntilPage(currentPage, true),
      }),
      [currentPage, loadUntilPage],
    );

    useEffect(() => {
      if (!hasApiToken) return;
      const targetCount = currentPage * ITEMS_PER_PAGE;
      const currentFilteredCount = getFilteredCount(allTorrents);

      if (currentFilteredCount < targetCount && hasMoreRd && !loading) {
        loadUntilPage(currentPage, false);
      }
    }, [
      currentPage,
      allTorrents,
      hasMoreRd,
      showCompletedOnly,
      searchQuery,
      hasApiToken,
      getFilteredCount,
      loadUntilPage,
      loading,
    ]);

    const handleDeleteTorrent = async (torrentId: string) => {
      await onDelete(torrentId);
      setAllTorrents((prev) => prev.filter((t) => t.id !== torrentId));
    };

    const filteredTorrents = useMemo(() => {
      let result = allTorrents;

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
    }, [allTorrents, searchQuery, showCompletedOnly]);

    const displayTorrents = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredTorrents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTorrents, currentPage]);

    const totalPages = Math.max(
      currentPage,
      Math.ceil(filteredTorrents.length / ITEMS_PER_PAGE) + (hasMoreRd ? 1 : 0),
    );

    return (
      <div className="space-y-6">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-1">
            <div className="typo-caption-uppercase text-muted-text">
              Cloud Transfer Index
            </div>
            <h1 className="typo-display-lg text-ink">Torrents</h1>
          </div>

          {/* Pipeline Stage Legend using DESIGN.md Timeline Pastels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="timeline-pill timeline-pill-thinking">
              Thinking
            </span>
            <span className="timeline-pill timeline-pill-read">Reading</span>
            <span className="timeline-pill timeline-pill-edit">Packing</span>
            <span className="timeline-pill timeline-pill-grep">Ready</span>
            <span className="timeline-pill timeline-pill-done">Done</span>
          </div>
        </div>

        {/* API Key Missing Banner & Device Auth */}
        {!hasApiToken && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[12px] border border-hairline bg-surface-card p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-hairline bg-canvas-soft text-ink">
                  <KeyIcon size={18} />
                </div>
                <div className="space-y-1">
                  <h2 className="typo-title-sm text-ink">
                    Real-Debrid Authentication Required
                  </h2>
                  <p className="typo-body-sm text-body">
                    Authorize this device via QR code below or configure a
                    personal API token in Settings.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenSettingsModal}
                className="shrink-0"
              >
                <GearIcon size={15} />
                <span>API Token Settings</span>
              </Button>
            </div>

            <DeviceAuthCard
              onSuccess={() => loadUntilPage(currentPage, true)}
            />
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setCurrentPage}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />

        <TorrentList
          torrents={displayTorrents}
          loading={loading}
          searchQuery={searchQuery}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={(torrent: Torrent) => toggle(torrent)}
          onPlay={onPlay}
          onShowDetails={onShowDetails}
          onDownload={onDownload}
          onDelete={handleDeleteTorrent}
          onCopyLink={onCopyLink}
          onOpenAddModal={onOpenAddModal}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setCurrentPage}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    );
  },
);

TorrentsPage.displayName = "TorrentsPage";
