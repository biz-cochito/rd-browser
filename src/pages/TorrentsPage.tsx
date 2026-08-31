import { useState, useEffect, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { TorrentList } from "@/components/TorrentList";
import { Pagination } from "@/components/Pagination";
import { DeviceAuthCard } from "@/components/DeviceAuthCard";
import { preloadAPI } from "@/services/preloadAPI";
import { useBookmarks } from "@/services/bookmarks";
import type { Torrent } from "@/types/torrent";
import { KeyIcon, QrCodeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 30;

export interface TorrentsPageRef {
    refresh: () => void;
}

interface TorrentsPageProps {
    searchQuery: string;
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
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const { bookmarkedIds, toggle } = useBookmarks();

    const loadTorrents = useCallback(async (page: number) => {
        setLoading(true);
        onLoadingChange(true);
        try {
            const result = await preloadAPI.getTorrents(page, ITEMS_PER_PAGE);
            setTorrents(result.torrents || []);
            setTotalPages(Math.ceil((result.totalCount || 0) / ITEMS_PER_PAGE) || 1);
        } catch (error) {
            console.error("Failed to load torrents:", error);
            showToast(error instanceof Error ? error.message : "Failed to load torrents.", "error");
        } finally {
            setLoading(false);
            onLoadingChange(false);
        }
    }, [onLoadingChange, showToast]);

    useImperativeHandle(ref, () => ({
        refresh: () => loadTorrents(currentPage),
    }), [currentPage, loadTorrents]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadTorrents(currentPage);
        }, 0);
        return () => clearTimeout(timer);
    }, [currentPage, loadTorrents]);

    const handleDeleteTorrent = async (torrentId: string) => {
        await onDelete(torrentId);
        await loadTorrents(currentPage);
    };

    const filteredTorrents = useMemo(() => {
        if (!searchQuery.trim()) return torrents;
        const q = searchQuery.toLowerCase();
        return torrents.filter(
            (t) => t.filename?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
        );
    }, [torrents, searchQuery]);

    return (
        <div className="space-y-4">
            {/* API Key Missing Card / Device Auth */}
            {!hasApiToken && (
                <div className="mb-8 space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                            <KeyIcon size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Real-Debrid Login Required</h4>
                                <p className="opacity-90 mt-0.5">
                                    Scan the QR code below on your phone or enter the 8-character code to authorize access.
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenSettingsModal}
                            className="shrink-0 border-amber-500/30 hover:bg-amber-500/10 font-medium text-xs flex items-center gap-1.5"
                        >
                            <QrCodeIcon size={14} />
                            Open Settings
                        </Button>
                    </div>

                    <DeviceAuthCard onSuccess={() => loadTorrents(currentPage)} />
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                loading={loading}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />

            <TorrentList
                torrents={filteredTorrents}
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
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
        </div>
    );
});

TorrentsPage.displayName = "TorrentsPage";
