import { render, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { preloadAPI } from "./preloadAPI";
import logo from "@asset/rdb-logo.svg";

const App = () => {
    const [torrents, setTorrents] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 30;

    const loadTorrents = async (page: number) => {
        setLoading(true);
        try {
            const result = await preloadAPI.getTorrents(page, itemsPerPage);
            setTorrents(result.torrents);
            setTotalPages(Math.ceil(result.totalCount / itemsPerPage) || 1);
        } catch (error) {
            console.error("Failed to load torrents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTorrents(currentPage);
    }, [currentPage]);

    const handlePlay = async (torrentId: string) => {
        try {
            const details = await preloadAPI.getTorrentDetails(torrentId);
            if (details?.links?.length > 0) {
                const unrestricted = await preloadAPI.unrestrictLink(
                    details.links[0],
                );
                if (unrestricted?.download) {
                    await preloadAPI.playVideo(unrestricted.download);
                }
            }
        } catch (error) {
            alert("Failed to start playback: " + (error as Error).message);
        }
    };

    const handleDownload = async (torrentId: string) => {
        try {
            const details = await preloadAPI.getTorrentDetails(torrentId);
            if (details?.links?.length > 0) {
                const unrestricted = await preloadAPI.unrestrictLink(
                    details.links[0],
                );
                if (unrestricted?.download) {
                    await preloadAPI.openExternal(unrestricted.download);
                }
            }
        } catch (error) {
            alert("Failed to start download: " + (error as Error).message);
        }
    };

    return (
        <div class="container">
            <div class="header">
                <span>
                    <img src={logo} alt="Real-Debrid" style="height: 32px;" />
                </span>
                <button
                    id="btn-refresh"
                    onClick={() => loadTorrents(currentPage)}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>
            <div class="wrapper">
                <div class="pagination">
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </button>
                    <span>
                        {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages || loading}
                    >
                        Next
                    </button>
                </div>
                <div class="torrent-list">
                    <div class="torrent-row torrent-header">
                        <div class="col-name">Name</div>
                        <div class="col-status input-group">
                            <div class="col-status">Status</div>
                            <div class="col-progress"></div>
                        </div>

                        <div class="col-actions">Actions</div>
                    </div>
                    {torrents.map((torrent) => (
                        <div class="torrent-row" key={torrent.id}>
                            <div
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "pre-wrap",
                                }}
                                class="col-name file-title"
                            >
                                <span id="file-title">{torrent.filename}</span>
                            </div>
                            <div class="input-group">
                                <div
                                    class={`material-symbols col-status ${torrent.status}`}
                                >
                                    {torrent.status === "downloaded"
                                        ? "check"
                                        : torrent.status === "error"
                                          ? "error"
                                          : "sync"}
                                    <div class="col-progress">
                                        {torrent.progress}%
                                    </div>
                                </div>
                            </div>

                            <div class="col-actions input-group">
                                <button
                                    onClick={() => handlePlay(torrent.id)}
                                    class="material-symbols button play_circle tertiary"
                                >
                                    play_arrow
                                </button>
                                <button
                                    onClick={() => handleDownload(torrent.id)}
                                    class="material-symbols button"
                                >
                                    download
                                </button>
                                <button class="material-symbols button">
                                    more_vert
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

render(<App />, document.getElementById("app")!);
