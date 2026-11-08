import { useState } from "react";
import {
  DownloadSimpleIcon,
  CopyIcon,
  TrashIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  ListChecksIcon,
  CheckIcon,
  BookmarkSimpleIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { Torrent } from "@/types/torrent";

interface TorrentRowProps {
  torrent: Torrent;
  isBookmarked?: boolean;
  onToggleBookmark?: (torrent: Torrent) => void;
  onPlay?: (torrentId: string) => void;
  onShowDetails: (torrentId: string) => void;
  onDownload: (torrentId: string) => void;
  onDelete: (torrentId: string) => void;
  onCopyLink: (torrentId: string) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getStatusTimelinePill(status?: string, progress?: number) {
  switch (status) {
    case "downloaded":
      return {
        className: "timeline-pill timeline-pill-grep",
        label: "Ready",
      };
    case "downloading":
    case "uploading":
      return {
        className: "timeline-pill timeline-pill-read",
        label: `Reading ${progress ?? 0}%`,
      };
    case "compressing":
      return {
        className: "timeline-pill timeline-pill-edit",
        label: "Packing",
      };
    case "waiting_files_selection":
      return {
        className: "timeline-pill timeline-pill-edit",
        label: "Select Files",
      };
    case "magnet_conversion":
    case "queued":
      return {
        className: "timeline-pill timeline-pill-thinking",
        label: "Thinking",
      };
    case "error":
    case "magnet_error":
    case "virus":
    case "dead":
      return {
        className:
          "timeline-pill bg-semantic-error/15 text-semantic-error border border-semantic-error/30",
        label: status.replace("_", " "),
      };
    default:
      return {
        className: "timeline-pill timeline-pill-done",
        label: status || "Done",
      };
  }
}

export function TorrentRow({
  torrent,
  isBookmarked = false,
  onToggleBookmark,
  onPlay,
  onShowDetails,
  onDownload,
  onDelete,
  onCopyLink,
}: TorrentRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyLink(torrent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDownloaded = torrent.status === "downloaded";
  const isDownloading =
    torrent.status === "downloading" ||
    torrent.status === "compressing" ||
    torrent.status === "uploading";
  const isWaiting = torrent.status === "waiting_files_selection";
  const isError =
    torrent.status?.includes("error") ||
    torrent.status === "virus" ||
    torrent.status === "dead";

  const progress = torrent.progress ?? (isDownloaded ? 100 : 0);
  const pill = getStatusTimelinePill(torrent.status, progress);

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[12px] border border-hairline bg-surface-card p-4 transition-colors hover:border-hairline-strong">
      {/* Left: Status Indicator & Editorial / Code Metadata */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <button
          type="button"
          onClick={() => onShowDetails(torrent.id)}
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-hairline bg-canvas-soft text-ink transition-colors hover:border-hairline-strong cursor-pointer"
          title="Inspect torrent files"
        >
          {isDownloaded ? (
            <CheckCircleIcon
              size={20}
              weight="fill"
              className="text-semantic-success"
            />
          ) : isDownloading ? (
            <CircleNotchIcon size={20} className="animate-spin text-ink" />
          ) : isWaiting ? (
            <ListChecksIcon size={20} className="text-ink" />
          ) : isError ? (
            <XCircleIcon
              size={20}
              weight="fill"
              className="text-semantic-error"
            />
          ) : (
            <FolderOpenIcon size={20} className="text-body" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={pill.className}>{pill.label}</span>
            <span className="rounded-[4px] border border-hairline-soft bg-canvas-soft px-1.5 py-0.5 font-mono text-[11px] text-muted-text">
              #{torrent.id.slice(0, 8)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onShowDetails(torrent.id)}
            className="block w-full text-left text-[15px] font-medium leading-[1.4] text-ink transition-colors hover:text-primary break-all cursor-pointer"
            title={torrent.filename || torrent.id}
          >
            {torrent.filename || "Untitled Torrent"}
          </button>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-muted-text">
            {torrent.bytes ? (
              <span className="text-body font-medium">
                {formatBytes(torrent.bytes)}
              </span>
            ) : null}

            {torrent.added ? (
              <>
                <span className="text-hairline-strong">·</span>
                <span>
                  {new Date(torrent.added).toISOString().slice(0, 10)}
                </span>
              </>
            ) : null}

            {torrent.links && torrent.links.length > 0 ? (
              <>
                <span className="text-hairline-strong">·</span>
                <span>
                  {torrent.links.length}{" "}
                  {torrent.links.length === 1 ? "file" : "files"}
                </span>
              </>
            ) : null}

            {torrent.speed ? (
              <>
                <span className="text-hairline-strong">·</span>
                <span className="text-ink font-medium">
                  {formatBytes(torrent.speed)}/s
                </span>
              </>
            ) : null}
          </div>

          {/* Active Download Progress Bar */}
          {isDownloading && (
            <div className="w-full max-w-sm pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap sm:flex-nowrap shrink-0 items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline-soft">
        {isDownloaded && onPlay && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPlay(torrent.id)}
            className="h-8 gap-1.5 px-3 text-[13px]"
            title="Stream primary file"
          >
            <PlayIcon size={14} weight="fill" />
            <span>Stream</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShowDetails(torrent.id)}
          className="h-8 gap-1.5 px-3 text-[13px]"
          title="View Files & Details"
        >
          <FolderOpenIcon size={15} className="text-body" />
          <span>Files</span>
        </Button>

        <div className="inline-flex items-center rounded-[8px] border border-hairline bg-canvas-soft p-0.5">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(torrent)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Torrent"}
              className={`inline-flex size-7 items-center justify-center rounded-[6px] transition-colors cursor-pointer ${
                isBookmarked
                  ? "bg-ink text-canvas"
                  : "text-body hover:bg-surface-strong/60 hover:text-ink"
              }`}
            >
              <BookmarkSimpleIcon
                size={15}
                weight={isBookmarked ? "fill" : "regular"}
              />
            </button>
          )}

          {isDownloaded && (
            <button
              type="button"
              onClick={() => onDownload(torrent.id)}
              title="Download Direct File"
              className="inline-flex size-7 items-center justify-center rounded-[6px] text-body transition-colors hover:bg-surface-strong/60 hover:text-ink cursor-pointer"
            >
              <DownloadSimpleIcon size={15} />
            </button>
          )}

          {isDownloaded && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Unrestrict Link"
              className="inline-flex size-7 items-center justify-center rounded-[6px] text-body transition-colors hover:bg-surface-strong/60 hover:text-ink cursor-pointer"
            >
              {copied ? (
                <CheckIcon
                  size={15}
                  weight="bold"
                  className="text-semantic-success"
                />
              ) : (
                <CopyIcon size={15} />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(torrent.id)}
            title="Delete Torrent"
            className="inline-flex size-7 items-center justify-center rounded-[6px] text-body transition-colors hover:bg-semantic-error/12 hover:text-semantic-error cursor-pointer"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
