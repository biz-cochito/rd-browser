import { useState, useEffect, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { TorrentList } from "@/components/TorrentList";
import { Pagination } from "@/components/Pagination";
import { DeviceAuthCard } from "@/components/DeviceAuthCard";
import { preloadAPI } from "@/services/preloadAPI";
import { useBookmarks } from "@/services/bookmarks";
import type { Torrent } from "@/types/torrent";
import { KeyIcon, QrCodeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export interface TorrentsPageRef {
    refresh: () => void;
}

interface TorrentsPageProps {
    searchQuery: string;
    hideFailed: boolean;
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

export const TorrentsPage = forwardRef<TorrentsPageRef, TorrentsPageProps>(({
    searchQuery,
    hideFailed,
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
}, ref) => {
    const ITEMS_PER_PAGE = 30;
    const ITEMS_PER_RD_FETCH = 100;

    const [allTorrents, setAllTorrents] = useState<Torrent[]>([]);
    const [rdPage, setRdPage] = useState(1);
    const [hasMoreRd, setHasMoreRd] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const { bookmarkedIds, toggle } = useBookmarks();

    const getFilteredCount = useCallback((torrents: Torrent[]) => {
        let result = torrents;
        if (hideFailed) {
            result = result.filter(
                (t) => !(t.status?.includes("error") || t.status === "virus" || t.status === "dead")
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) => t.filename?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
            );
        }
        return result.length;
    }, [hideFailed, searchQuery]);

    const loadUntilPage = useCallback(async (targetUiPage: number, forceRefresh = false) => {
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
                const result = await preloadAPI.getTorrents(currentRdPage, ITEMS_PER_RD_FETCH);
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
            showToast(error instanceof Error ? error.message : "Failed to load torrents.", "error");
        } finally {
            setLoading(false);
            onLoadingChange(false);
        }
    }, [allTorrents, rdPage, hasMoreRd, getFilteredCount, onLoadingChange, showToast]);

    useImperativeHandle(ref, () => ({
        refresh: () => loadUntilPage(currentPage, true),
    }), [currentPage, loadUntilPage]);

    useEffect(() => {
        if (!hasApiToken) return;
        const targetCount = currentPage * ITEMS_PER_PAGE;
        const currentFilteredCount = getFilteredCount(allTorrents);
        
        if (currentFilteredCount < targetCount && hasMoreRd && !loading) {
            loadUntilPage(currentPage, false);
        }
    }, [currentPage, allTorrents, hasMoreRd, hideFailed, searchQuery, hasApiToken, getFilteredCount, loadUntilPage, loading]);

    const handleDeleteTorrent = async (torrentId: string) => {
        await onDelete(torrentId);
        // Remove locally immediately without full refresh
        setAllTorrents((prev) => prev.filter(t => t.id !== torrentId));
    };

    const filteredTorrents = useMemo(() => {
        let result = allTorrents;

        if (hideFailed) {
            result = result.filter(
                (t) => !(t.status?.includes("error") || t.status === "virus" || t.status === "dead")
            );
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) => t.filename?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
            );
        }

        return result;
    }, [allTorrents, searchQuery, hideFailed]);

    const displayTorrents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTorrents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTorrents, currentPage]);

    const totalPages = Math.max(
        currentPage, 
        Math.ceil(filteredTorrents.length / ITEMS_PER_PAGE) + (hasMoreRd ? 1 : 0)
    );

    return (
        <div className="space-y-4">
            {/* API Key Missing Card / Device Auth */}
            {!hasApiToken && (
                <div className="mb-8 space-y-4">
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                            <KeyIcon size={20} className="shrink-0 mt-0.5 text-zinc-400" />
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-100">Real-Debrid Login Required</h4>
                                <p className="opacity-90 mt-0.5 text-zinc-400">
                                    Scan the QR code below on your phone or enter the 8-character code to authorize access.
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenSettingsModal}
                            className="shrink-0 border-zinc-700 hover:bg-zinc-800 font-medium text-xs text-zinc-200 flex items-center gap-1.5"
                        >
                            <QrCodeIcon size={14} />
                            Open Settings
                        </Button>
                    </div>

                    <DeviceAuthCard onSuccess={() => loadUntilPage(currentPage, true)} />
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
});

TorrentsPage.displayName = "TorrentsPage";
