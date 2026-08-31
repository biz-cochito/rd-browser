import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { TorrentsPage, type TorrentsPageRef } from "@/pages/TorrentsPage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { InputLinksDialog } from "@/components/InputLinksDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { TorrentDetailsModal } from "@/components/TorrentDetailsModal";
import { preloadAPI } from "@/services/preloadAPI";
import { addMagnetLinks, getFirstDownloadUrl } from "@/services/torrentActions";
import { useBookmarks } from "@/services/bookmarks";
import { WarningIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react";

export default function App() {
    const [activeTab, setActiveTab] = useState<"torrents" | "bookmarks">("torrents");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const { bookmarks } = useBookmarks();
    const torrentsPageRef = useRef<TorrentsPageRef>(null);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Selected state
    const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(null);
    const [playbackUrl, setPlaybackUrl] = useState<string>("");
    const [playbackTitle, setPlaybackTitle] = useState<string>("");
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [token, setToken] = useState<string | null>(() => preloadAPI.getApiToken());

    useEffect(() => {
        // Sync API token with server on mount
        fetch("/api/getApiToken", { method: "POST" })
            .then((r) => r.json())
            .then((data) => {
                const serverToken = (data.result || "").trim();
                if (serverToken) {
                    localStorage.setItem("rd_api_token", serverToken);
                    setToken(serverToken);
                }
            })
            .catch(() => {});
    }, []);

    const hasApiToken = Boolean(token);

    const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    const handlePlay = async (torrentId: string) => {
        try {
            const title = "Video Playback";
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
        try {
            await preloadAPI.deleteTorrent(torrentId);
            showToast("Deleted torrent");
        } catch (error) {
            showToast("Failed to delete: " + (error as Error).message, "error");
            throw error;
        }
    };

    const handleAddLinks = async (text: string) => {
        try {
            const res = await addMagnetLinks(preloadAPI, text);
            showToast(`Successfully added ${res.addedCount} link(s)!`);
            torrentsPageRef.current?.refresh();
        } catch (error) {
            showToast("Failed to add links: " + (error as Error).message, "error");
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Fixed App Header */}
            <Header
                loading={loading}
                searchQuery={searchQuery}
                activeTab={activeTab}
                bookmarkCount={bookmarks.length}
                onTabChange={setActiveTab}
                onSearchChange={setSearchQuery}
                onRefresh={() => torrentsPageRef.current?.refresh()}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                hasApiToken={hasApiToken}
            />

            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-6 flex-1 max-w-6xl">
                {/* Notification Toast */}
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
                            className="p-1 hover:opacity-70 rounded-lg text-muted-foreground hover:text-foreground"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>
                )}

                {activeTab === "torrents" ? (
                    <TorrentsPage
                        ref={torrentsPageRef}
                        searchQuery={searchQuery}
                        hasApiToken={hasApiToken}
                        onLoadingChange={setLoading}
                        showToast={showToast}
                        onPlay={handlePlay}
                        onShowDetails={handleShowDetails}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onCopyLink={handleCopyLink}
                        onOpenAddModal={() => setIsAddModalOpen(true)}
                        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                    />
                ) : (
                    <BookmarksPage
                        searchQuery={searchQuery}
                        onPlay={handlePlay}
                        onShowDetails={handleShowDetails}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onCopyLink={handleCopyLink}
                        onOpenAddModal={() => setIsAddModalOpen(true)}
                    />
                )}
            </main>

            {/* Global Dialogs */}
            <InputLinksDialog
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAddLinks={handleAddLinks}
            />

            <SettingsDialog
                open={isSettingsModalOpen}
                onOpenChange={setIsSettingsModalOpen}
                onSettingsSaved={() => {
                    setToken(preloadAPI.getApiToken());
                    torrentsPageRef.current?.refresh();
                }}
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
