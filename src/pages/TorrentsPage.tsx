import { useEffect, useState } from "preact/hooks";
import { Header } from "@components/Header";
import { Pagination } from "@components/Pagination";
import { TorrentList } from "@components/TorrentList";
import { VideoPlayerModal } from "@components/VideoPlayerModal";
import { preloadAPI } from "@services/preloadAPI";
import type { Torrent } from "@models/torrent";

const ITEMS_PER_PAGE = 30;

export function TorrentsPage() {
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [playbackUrl, setPlaybackUrl] = useState<string>("");
    const [playbackTitle, setPlaybackTitle] = useState<string>("");
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    const loadTorrents = async (page: number) => {
        setLoading(true);
        try {
            const result = await preloadAPI.getTorrents(page, ITEMS_PER_PAGE);
            setTorrents(result.torrents);
            setTotalPages(Math.ceil(result.totalCount / ITEMS_PER_PAGE) || 1);
        } catch (error) {
            console.error("Failed to load torrents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTorrents(currentPage);
    }, [currentPage]);

    const getFirstDownloadUrl = async (torrentId: string) => {
        const details = await preloadAPI.getTorrentDetails(torrentId);

        if (!details?.links?.length) {
            throw new Error("This torrent has no downloadable links.");
        }

        const unrestricted = await preloadAPI.unrestrictLink(details.links[0]);

        if (!unrestricted?.download) {
            throw new Error(
                "Failed to get a direct download link from Real-Debrid.",
            );
        }

        return unrestricted.download;
    };

    const handlePlay = async (torrentId: string) => {
        try {
            const torrent = torrents.find((t) => t.id === torrentId);
            const title = torrent?.filename || "Video Playback";
            setPlaybackTitle(title);

            const downloadUrl = await getFirstDownloadUrl(torrentId);
            setPlaybackUrl(downloadUrl);
            setIsPlayerOpen(true);
        } catch (error) {
            alert("Failed to start playback: " + (error as Error).message);
        }
    };

    const handleDownload = async (torrentId: string) => {
        try {
            const downloadUrl = await getFirstDownloadUrl(torrentId);
            await preloadAPI.openExternal(downloadUrl);
        } catch (error) {
            alert("Failed to start download: " + (error as Error).message);
        }
    };

    return (
        <div class="container w-full p-0">
            <Header
                loading={loading}
                onRefresh={() => loadTorrents(currentPage)}
            />
            <VideoPlayerModal
                isOpen={isPlayerOpen}
                videoUrl={playbackUrl}
                title={playbackTitle}
                onClose={() => setIsPlayerOpen(false)}
            />
            <div class="wrapper">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={loading}
                    onPrevious={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    onNext={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                />
                <TorrentList
                    torrents={torrents}
                    onPlay={handlePlay}
                    onDownload={handleDownload}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={loading}
                    onPrevious={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    onNext={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                />
            </div>
        </div>
    );
}
