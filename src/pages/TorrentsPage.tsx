import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { TorrentList } from "@/components/TorrentList";
import { Pagination } from "@/components/Pagination";
import { InputLinksDialog } from "@/components/InputLinksDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { TorrentDetailsModal } from "@/components/TorrentDetailsModal";
import { preloadAPI } from "@/services/preloadAPI";
import { addMagnetLinks, getFirstDownloadUrl } from "@/services/torrentActions";
import type { Torrent } from "@/types/torrent";
import { WarningIcon, KeyIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 30;

export function TorrentsPage() {
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Modal state
    const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(null);
    const [playbackUrl, setPlaybackUrl] = useState<string>("");
    const [playbackTitle, setPlaybackTitle] = useState<string>("");
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [token, setToken] = useState<string | null>(() => preloadAPI.getApiToken());

    useEffect(() => {
        if (!token) {
            fetch("/api/getApiToken", { method: "POST" })
                .then((r) => r.json())
                .then((data) => {
                    if (data.result) {
                        preloadAPI.setApiToken(data.result);
                        setToken(data.result);
                    }
                })
                .catch(() => {});
        }
    }, [token]);

    const hasApiToken = Boolean(token);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const loadTorrents = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const result = await preloadAPI.getTorrents(page, ITEMS_PER_PAGE);
            setTorrents(result.torrents || []);
            setTotalPages(Math.ceil((result.totalCount || 0) / ITEMS_PER_PAGE) || 1);
        } catch (error) {
            console.error("Failed to load torrents:", error);
            showToast(error instanceof Error ? error.message : "Failed to load torrents.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadTorrents(currentPage);
        }, 0);
        return () => clearTimeout(timer);
    }, [currentPage, loadTorrents]);

    const handlePlay = async (torrentId: string) => {
        try {
            const torrent = torrents.find((t) => t.id === torrentId);
            const title = torrent?.filename || "Video Playback";
            setPlaybackTitle(title);

            const downloadUrl = await getFirstDownloadUrl(preloadAPI, torrentId);
            setPlaybackUrl(downloadUrl);
            setIsPlayerOpen(true);
        } catch (error) {
            showToast("Failed to start playback: " + (error as Error).message, "error");
        }
    };

    const handlePlayUrl = (url: string, title: string) => {
        setPlaybackUrl(url);
        setPlaybackTitle(title);
        setIsPlayerOpen(true);
    };

    const handleShowDetails = (torrentId: string) => {
        setSelectedTorrentId(torrentId);
        setIsDetailsOpen(true);
    };

    const handleDownload = async (torrentId: string) => {
        try {
            const downloadUrl = await getFirstDownloadUrl(preloadAPI, torrentId);
            await preloadAPI.openExternal(downloadUrl);
        } catch (error) {
            showToast("Failed to download: " + (error as Error).message, "error");
        }
    };

    const handleCopyLink = async (torrentId: string) => {
        try {
            const downloadUrl = await getFirstDownloadUrl(preloadAPI, torrentId);
            await navigator.clipboard.writeText(downloadUrl);
            showToast("Direct download link copied to clipboard!");
        } catch (error) {
            showToast("Failed to copy link: " + (error as Error).message, "error");
        }
    };

    const handleDelete = async (torrentId: string) => {
        const torrent = torrents.find((t) => t.id === torrentId);
        const title = torrent?.filename || "this torrent";

        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            await preloadAPI.deleteTorrent(torrentId);
            showToast(`Deleted "${title}"`);
            await loadTorrents(currentPage);
        } catch (error) {
            showToast("Failed to delete: " + (error as Error).message, "error");
        }
    };

    const handleAddLinks = async (text: string) => {
        try {
            const res = await addMagnetLinks(preloadAPI, text);
            showToast(`Successfully added ${res.addedCount} link(s)!`);
            await loadTorrents(currentPage);
        } catch (error) {
            showToast("Failed to add links: " + (error as Error).message, "error");
            throw error;
        }
    };

    const filteredTorrents = useMemo(() => {
        if (!searchQuery.trim()) return torrents;
        const q = searchQuery.toLowerCase();
        return torrents.filter(
            (t) => t.filename?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
        );
    }, [torrents, searchQuery]);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={() => loadTorrents(currentPage)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                hasApiToken={hasApiToken}
            />

            <main className="container mx-auto px-4 py-6 flex-1 max-w-6xl">
                {/* Toast Notification */}
                {notification && (
                    <div
                        className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 ${
                            notification.type === "error"
                                ? "bg-destructive/15 border-destructive/30 text-destructive"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {notification.type === "error" ? (
                                <WarningIcon size={16} />
                            ) : (
                                <CheckCircleIcon size={16} />
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="p-1 hover:opacity-70 rounded-lg"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>
                )}

                {/* API Key Missing Banner */}
                {!hasApiToken && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                            <KeyIcon size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Real-Debrid API Token Required</h4>
                                <p className="opacity-90 mt-0.5">
                                    Set your Real-Debrid API token in settings to view, download, and stream your torrents.
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="shrink-0 border-amber-500/30 hover:bg-amber-500/10 font-medium"
                        >
                            Configure Token
                        </Button>
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
                    onPlay={handlePlay}
                    onShowDetails={handleShowDetails}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onCopyLink={handleCopyLink}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={loading}
                    onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                />
            </main>

            {/* Dialogs */}
            <InputLinksDialog
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAddLinks={handleAddLinks}
            />

            <SettingsDialog
                open={isSettingsModalOpen}
                onOpenChange={setIsSettingsModalOpen}
                onSettingsSaved={() => loadTorrents(currentPage)}
            />

            <VideoPlayerModal
                open={isPlayerOpen}
                videoUrl={playbackUrl}
                title={playbackTitle}
                onOpenChange={setIsPlayerOpen}
            />

            <TorrentDetailsModal
                open={isDetailsOpen}
                torrentId={selectedTorrentId}
                onOpenChange={setIsDetailsOpen}
                onPlayUrl={handlePlayUrl}
            />
        </div>
    );
}
