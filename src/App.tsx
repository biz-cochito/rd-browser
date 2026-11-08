import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { TorrentsPage, type TorrentsPageRef } from "@/pages/TorrentsPage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { InputLinksDialog } from "@/components/InputLinksDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { TorrentDetailsModal } from "@/components/TorrentDetailsModal";
import { preloadAPI } from "@/services/preloadAPI";
import { addMagnetLinks, getDownloadUrls } from "@/services/torrentActions";
import { useBookmarks } from "@/services/bookmarks";
import { WarningCircleIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"torrents" | "bookmarks">(
    "torrents",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompletedOnly, setShowCompletedOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  const { bookmarks } = useBookmarks();
  const torrentsPageRef = useRef<TorrentsPageRef>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Selected state
  const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(
    null,
  );
  const [playbackUrl, setPlaybackUrl] = useState<string>("");
  const [playbackTitle, setPlaybackTitle] = useState<string>("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [token, setToken] = useState<string | null>(() =>
    preloadAPI.getApiToken(),
  );

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

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4000);
    },
    [],
  );

  const handlePlay = async (torrentId: string) => {
    try {
      const title = "Video Playback";
      setPlaybackTitle(title);

      const downloadUrl = await getDownloadUrls(preloadAPI, torrentId);
      if (!downloadUrl.download) {
        throw new Error("No valid download link found.");
      }
      setPlaybackUrl(downloadUrl.download);
      setIsPlayerOpen(true);
    } catch (error) {
      showToast(
        "Failed to start playback: " + (error as Error).message,
        "error",
      );
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
      const downloadUrl = await getDownloadUrls(preloadAPI, torrentId);
      if (!downloadUrl.download) {
        throw new Error("No valid download link found.");
      }
      await preloadAPI.openExternal(downloadUrl.download);
    } catch (error) {
      showToast("Failed to download: " + (error as Error).message, "error");
    }
  };

  const handleCopyLink = async (torrentId: string) => {
    try {
      const downloadUrl = await getDownloadUrls(preloadAPI, torrentId);
      if (!downloadUrl.download) {
        throw new Error("No valid download link found.");
      }
      await navigator.clipboard.writeText(downloadUrl.download);
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
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Navigation */}
      <Header
        loading={loading}
        searchQuery={searchQuery}
        showCompletedOnly={showCompletedOnly}
        activeTab={activeTab}
        bookmarkCount={bookmarks.length}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
        onShowCompletedOnlyChange={setShowCompletedOnly}
        onRefresh={() => torrentsPageRef.current?.refresh()}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        hasApiToken={hasApiToken}
      />

      {/* Main Editorial Workspace */}
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-6 flex items-center justify-between gap-3 rounded-[8px] border bg-surface-card px-4 py-3 text-[13px] animate-in fade-in slide-in-from-top-1 ${
              notification.type === "error"
                ? "border-semantic-error/40 text-semantic-error"
                : "border-semantic-success/40 text-semantic-success"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "error" ? (
                <WarningCircleIcon size={24} weight="fill" />
              ) : (
                <CheckCircleIcon size={24} weight="fill" />
              )}
              <span className="font-medium text-ink">
                {notification.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="rounded-[6px] p-1 text-muted-text transition-colors hover:bg-canvas-soft hover:text-ink cursor-pointer"
              aria-label="Dismiss notification"
            >
              <XIcon size={24} />
            </button>
          </div>
        )}

        {activeTab === "torrents" ? (
          <TorrentsPage
            ref={torrentsPageRef}
            searchQuery={searchQuery}
            showCompletedOnly={showCompletedOnly}
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
            showCompletedOnly={showCompletedOnly}
            onPlay={handlePlay}
            onShowDetails={handleShowDetails}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onCopyLink={handleCopyLink}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-hairline bg-canvas">
        <div className="mx-auto flex max-w-[1200px] flex-col sm:flex-row items-center justify-between gap-3 px-4 py-6 sm:px-6 typo-body-sm text-body">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">RD Browser</span>
            <span className="text-hairline-strong">·</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[12px] text-muted-text">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${
                  hasApiToken ? "bg-semantic-success" : "bg-primary"
                }`}
              />
              {hasApiToken ? "API Connected" : "Awaiting Auth"}
            </span>
            <span className="text-hairline-strong">·</span>
            <span>Press D to toggle theme</span>
          </div>
        </div>
      </footer>

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
