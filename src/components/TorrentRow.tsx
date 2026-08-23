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
  CheckIcon,
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
    <div className="group md:flex-column md:items-flex-start flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
      {/* Left: Name & Metadata */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          onClick={() => onShowDetails(torrent.id)}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
          title="View torrent details"
        >
          <FolderIcon size={32} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3
            onClick={() =>
              isDownloaded ? onPlay(torrent.id) : onShowDetails(torrent.id)
            }
            className="cursor-pointer truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
            title={torrent.filename || torrent.id}
          >
            {torrent.filename || "Untitled Torrent"}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {torrent.bytes ? <span>{formatBytes(torrent.bytes)}</span> : null}
            {torrent.bytes && torrent.added ? <span>•</span> : null}
            {torrent.added ? (
              <span>{new Date(torrent.added).toLocaleDateString()}</span>
            ) : null}
            {torrent.speed ? (
              <>
                <span>•</span>
                <span className="font-mono text-blue-500">
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

      {/* Middle: Status Badge */}
      <div className="flex shrink-0 items-center gap-3">
        {isDownloaded && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon size={26} weight="fill" />
            Ready
          </span>
        )}
        {isDownloading && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            <CircleNotchIcon size={26} className="animate-spin" />
            {progress}%
          </span>
        )}
        {isWaiting && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <ListChecksIcon size={26} />
            Select Files
          </span>
        )}
        {isError && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <XCircleIcon size={26} weight="fill" />
            {torrent.status || "Error"}
          </span>
        )}
        {!isDownloaded && !isDownloading && !isWaiting && !isError && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground capitalize">
            {torrent.status || "Processing"}
          </span>
        )}

        {/* Right: Actions */}
        <div className="flex gap-2">
          {isDownloaded && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onPlay(torrent.id)}
              className="h-8 gap-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0 font-medium text-emerald-600 dark:text-emerald-400"
              title="Play Video"
            >
              <PlayIcon size={14} weight="bold" />
              <span className="hidden p-0 sm:inline">Play</span>
            </Button>
          )}

          <ButtonGroup className="gap-0 py-0">
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onShowDetails(torrent.id)}
              title="View Files / Details"
              className="rounded-full border-ring bg-secondary px-2"
            >
              <FolderIcon size={24} />
            </Button>

            {isDownloaded && (
              <Button
                variant="ghost"
                size="icon-md"
                onClick={() => onDownload(torrent.id)}
                title="Download File"
                className="rounded-full border-ring bg-secondary px-2"
              >
                <DownloadSimpleIcon size={24} />
              </Button>
            )}

            {isDownloaded && (
              <Button
                variant="ghost"
                size="icon-md"
                onClick={handleCopy}
                title="Copy Download Link"
                className="rounded-full border-ring bg-secondary px-2"
              >
                {copied ? (
                  <CheckIcon size={24} className="text-emerald-500" />
                ) : (
                  <CopyIcon size={24} />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onDelete(torrent.id)}
              className="rounded-full border-ring bg-secondary px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Delete Torrent"
            >
              <TrashIcon size={24} />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}
