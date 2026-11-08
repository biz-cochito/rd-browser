import { useState, useEffect, useCallback } from "react";
import {
  FolderOpenIcon,
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
  const [unrestrictingIndex, setUnrestrictingIndex] = useState<number | null>(
    null,
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const info = await preloadAPI.getTorrentDetails(id);
      setDetails(info);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load torrent details.",
      );
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
      alert(
        "Error unrestricting link: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
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

  const handlePlayLink = async (
    link: string,
    filename: string,
    index: number,
  ) => {
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
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2">
            <span className="timeline-pill timeline-pill-read">Inspector</span>
            {torrentId && (
              <span className="font-mono text-[11px] text-muted-text">
                #{torrentId}
              </span>
            )}
          </div>
          <DialogTitle className="flex items-center gap-2 truncate pt-1">
            <FolderOpenIcon size={20} className="text-ink shrink-0" />
            <span className="truncate">
              {details?.filename || "Torrent Inspector"}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-body">
            <CircleNotchIcon size={28} className="animate-spin text-ink" />
            <span className="font-mono text-[13px]">
              Reading torrent manifest & links...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-[8px] border border-semantic-error/30 bg-semantic-error/8 p-4 text-center text-[13px] text-semantic-error">
            {error}
          </div>
        ) : details ? (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* IDE-pane Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-[8px] border border-hairline bg-canvas-soft p-4">
              <div>
                <span className="typo-caption-uppercase text-muted-text block">
                  Stage
                </span>
                <span className="mt-1 inline-block font-mono text-[13px] font-medium uppercase text-ink">
                  {details.status}
                </span>
              </div>
              <div>
                <span className="typo-caption-uppercase text-muted-text block">
                  Size
                </span>
                <span className="mt-1 block font-mono text-[13px] font-medium text-ink">
                  {formatBytes(details.bytes)}
                </span>
              </div>
              <div>
                <span className="typo-caption-uppercase text-muted-text block">
                  Progress
                </span>
                <span className="mt-1 block font-mono text-[13px] font-medium text-ink">
                  {details.progress}%
                </span>
              </div>
              <div>
                <span className="typo-caption-uppercase text-muted-text block">
                  Files
                </span>
                <span className="mt-1 block font-mono text-[13px] font-medium text-ink">
                  {details.links?.length || 0}
                </span>
              </div>
            </div>

            {/* File Links List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="typo-caption-uppercase text-muted-text">
                  Cached File Links ({details.links?.length || 0})
                </h4>
              </div>

              {details.links && details.links.length > 0 ? (
                <div className="divide-y divide-hairline-soft rounded-[12px] border border-hairline overflow-hidden bg-surface-card">
                  {details.links.map((link, idx) => {
                    const fileObj = details.files?.[idx];
                    const name = fileObj ? fileObj.path : `File ${idx + 1}`;
                    const size = fileObj ? formatBytes(fileObj.bytes) : "";
                    const isUnrestricting = unrestrictingIndex === idx;

                    return (
                      <div
                        key={link || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 transition-colors hover:bg-canvas-soft"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <FileVideoIcon
                            size={18}
                            className="mt-0.5 text-muted-text shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[13px] text-ink break-all leading-snug">
                              {name}
                            </p>
                            {size && (
                              <span className="font-mono text-[11px] text-muted-text">
                                {size}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handlePlayLink(link, name, idx)}
                            disabled={isUnrestricting}
                            title="Stream Video"
                          >
                            <PlayIcon size={12} weight="fill" />
                            <span>Stream</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => handleDownloadLink(link, idx)}
                            disabled={isUnrestricting}
                            title="Download File"
                          >
                            <DownloadSimpleIcon size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => handleCopyLink(link, idx)}
                            disabled={isUnrestricting}
                            title="Copy Direct Link"
                          >
                            {copiedIndex === idx ? (
                              <CheckIcon
                                size={14}
                                weight="bold"
                                className="text-semantic-success"
                              />
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
                <div className="rounded-[8px] border border-hairline bg-canvas-soft p-6 text-center typo-body-sm text-muted-text">
                  No unrestricted links are available for this torrent yet.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
