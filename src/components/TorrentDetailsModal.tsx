import { useState, useEffect, useCallback } from "react";
import {
    FolderIcon,
    FileVideoIcon,
    DownloadSimpleIcon,
    CopyIcon,
    PlayIcon,
    CircleNotchIcon,
    CheckIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { TorrentInfo } from "@/types/torrent";
import { preloadAPI } from "@/services/preloadAPI";

interface TorrentDetailsModalProps {
    open: boolean;
    torrentId: string | null;
    onOpenChange: (open: boolean) => void;
    onPlayUrl: (url: string, title: string) => void;
}

function formatBytes(bytes?: number): string {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function TorrentDetailsModal({
    open,
    torrentId,
    onOpenChange,
    onPlayUrl,
}: TorrentDetailsModalProps) {
    const [details, setDetails] = useState<TorrentInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [unrestrictingIndex, setUnrestrictingIndex] = useState<number | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDetails = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const info = await preloadAPI.getTorrentDetails(id);
            setDetails(info);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load torrent details.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && torrentId) {
            const timer = setTimeout(() => {
                loadDetails(torrentId);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, torrentId, loadDetails]);

    const getUnrestrictedUrl = async (link: string, index: number) => {
        setUnrestrictingIndex(index);
        try {
            const res = await preloadAPI.unrestrictLink(link);
            if (!res.download) throw new Error("No direct download link returned.");
            return res.download;
        } catch (err) {
            alert("Error unrestricting link: " + (err instanceof Error ? err.message : "Unknown error"));
            return null;
        } finally {
            setUnrestrictingIndex(null);
        }
    };

    const handleDownloadLink = async (link: string, index: number) => {
        const downloadUrl = await getUnrestrictedUrl(link, index);
        if (downloadUrl) {
            await preloadAPI.openExternal(downloadUrl);
        }
    };

    const handlePlayLink = async (link: string, filename: string, index: number) => {
        const downloadUrl = await getUnrestrictedUrl(link, index);
        if (downloadUrl) {
            onPlayUrl(downloadUrl, filename);
            onOpenChange(false);
        }
    };

    const handleCopyLink = async (link: string, index: number) => {
        const downloadUrl = await getUnrestrictedUrl(link, index);
        if (downloadUrl) {
            await navigator.clipboard.writeText(downloadUrl);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold pr-6 truncate">
                        <FolderIcon size={20} className="text-primary shrink-0" />
                        <span className="truncate">{details?.filename || "Torrent Details"}</span>
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                        <CircleNotchIcon size={32} className="animate-spin text-primary" />
                        <span className="text-sm">Fetching files & links...</span>
                    </div>
                ) : error ? (
                    <div className="py-6 text-center text-sm text-destructive">{error}</div>
                ) : details ? (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {/* Meta summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-muted/40 rounded-xl text-xs">
                            <div>
                                <span className="text-muted-foreground block">Status</span>
                                <span className="font-semibold uppercase">{details.status}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Size</span>
                                <span className="font-semibold">{formatBytes(details.bytes)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Progress</span>
                                <span className="font-semibold">{details.progress}%</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Links</span>
                                <span className="font-semibold">{details.links?.length || 0}</span>
                            </div>
                        </div>

                        {/* File Links List */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                File Links ({details.links?.length || 0})
                            </h4>

                            {details.links && details.links.length > 0 ? (
                                <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card text-xs">
                                    {details.links.map((link, idx) => {
                                        const fileObj = details.files?.[idx];
                                        const name = fileObj ? fileObj.path : `File ${idx + 1}`;
                                        const size = fileObj ? formatBytes(fileObj.bytes) : "";
                                        const isUnrestricting = unrestrictingIndex === idx;

                                        return (
                                            <div
                                                key={link || idx}
                                                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <FileVideoIcon size={18} className="text-muted-foreground shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{name}</p>
                                                        {size && (
                                                            <span className="text-[11px] text-muted-foreground">{size}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => handlePlayLink(link, name, idx)}
                                                        disabled={isUnrestricting}
                                                        title="Stream Video"
                                                    >
                                                        <PlayIcon size={14} className="mr-1" /> Stream
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => handleDownloadLink(link, idx)}
                                                        disabled={isUnrestricting}
                                                        title="Download File"
                                                    >
                                                        <DownloadSimpleIcon size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => handleCopyLink(link, idx)}
                                                        disabled={isUnrestricting}
                                                        title="Copy Link"
                                                    >
                                                        {copiedIndex === idx ? (
                                                            <CheckIcon size={14} className="text-emerald-500" />
                                                        ) : (
                                                            <CopyIcon size={14} />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-xs text-muted-foreground">
                                    No direct links available for this torrent yet.
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
