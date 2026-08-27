import { useState } from "react"
import {
  PlayIcon,
  DownloadSimpleIcon,
  CopyIcon,
  TrashIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  ListChecksIcon,
  CheckIcon
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { Torrent } from "@/types/torrent"
import { ButtonGroup } from "./ui/button-group"

interface TorrentRowProps {
  torrent: Torrent
  onPlay: (torrentId: string) => void
  onShowDetails: (torrentId: string) => void
  onDownload: (torrentId: string) => void
  onDelete: (torrentId: string) => void
  onCopyLink: (torrentId: string) => void
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function TorrentRow({
  torrent,
  onPlay,
  onShowDetails,
  onDownload,
  onDelete,
  onCopyLink,
}: TorrentRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopyLink(torrent.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isDownloaded = torrent.status === "downloaded"
  const isDownloading =
    torrent.status === "downloading" || torrent.status === "compressing"
  const isWaiting = torrent.status === "waiting_files_selection"
  const isError =
    torrent.status?.includes("error") ||
    torrent.status === "virus" ||
    torrent.status === "dead"

  const progress = torrent.progress ?? (isDownloaded ? 100 : 0)

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      {/* Left: Status Icon & Metadata */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <div
          onClick={() => isDownloaded ? onPlay(torrent.id) : onShowDetails(torrent.id)}
          className={`mt-0.5 shrink-0 cursor-pointer rounded-xl p-2 transition-all shadow-xs ${
            isDownloaded
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              : isDownloading
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
              : isWaiting
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              : isError
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`}
          title={
            isDownloaded
              ? "Ready (Click to Play)"
              : isDownloading
              ? `Downloading (${progress}%)`
              : isWaiting
              ? "Select Files"
              : isError
              ? torrent.status || "Error"
              : "View torrent details"
          }
        >
          {isDownloaded ? (
            <CheckCircleIcon size={28} weight="fill" />
          ) : isDownloading ? (
            <CircleNotchIcon size={28} className="animate-spin" />
          ) : isWaiting ? (
            <ListChecksIcon size={28} />
          ) : isError ? (
            <XCircleIcon size={28} weight="fill" />
          ) : (
            <FolderIcon size={28} />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3
            onClick={() =>
              isDownloaded ? onPlay(torrent.id) : onShowDetails(torrent.id)
            }
            className="cursor-pointer line-clamp-3 text-sm font-medium text-foreground transition-colors hover:text-primary leading-relaxed break-words"
            title={torrent.filename || torrent.id}
          >
            {torrent.filename || "Untitled Torrent"}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {torrent.bytes ? <span className="font-medium text-foreground/80">{formatBytes(torrent.bytes)}</span> : null}
            {torrent.bytes && torrent.added ? <span className="text-muted-foreground/60">•</span> : null}
            {torrent.added ? (
              <span>{new Date(torrent.added).toLocaleDateString()}</span>
            ) : null}
            {torrent.speed ? (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-mono font-medium text-blue-500">
                  {formatBytes(torrent.speed)}/s
                </span>
              </>
            ) : null}
          </div>

          {/* Download Progress Bar */}
          {isDownloading && (
            <div className="w-full max-w-xs space-y-1 pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap sm:flex-nowrap shrink-0 items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {isDownloaded && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onPlay(torrent.id)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
              title="Play Video"
            >
              <PlayIcon size={15} weight="fill" />
              <span>Play</span>
            </Button>
          )}

          <ButtonGroup className="shadow-xs bg-secondary/50 rounded-lg p-0.5 border border-border/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowDetails(torrent.id)}
              title="View Files / Details"
              className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md"
            >
              <FolderIcon size={16} />
              <span className="text-xs hidden md:inline">Files</span>
            </Button>

            {isDownloaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(torrent.id)}
                title="Download File"
                className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md"
              >
                <DownloadSimpleIcon size={16} />
              </Button>
            )}

            {isDownloaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                title="Copy Download Link"
                className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md"
              >
                {copied ? (
                  <CheckIcon size={16} className="text-emerald-500" />
                ) : (
                  <CopyIcon size={16} />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(torrent.id)}
              className="h-8 px-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md"
              title="Delete Torrent"
            >
              <TrashIcon size={16} />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}
