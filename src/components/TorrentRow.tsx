import { useState } from "react"
import {
  DownloadSimpleIcon,
  CopyIcon,
  TrashIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  ListChecksIcon,
  CheckIcon,
  BookmarkIcon
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { Torrent } from "@/types/torrent"
import { ButtonGroup } from "./ui/button-group"

interface TorrentRowProps {
  torrent: Torrent
  isBookmarked?: boolean
  onToggleBookmark?: (torrent: Torrent) => void
  onPlay?: (torrentId: string) => void
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
  isBookmarked = false,
  onToggleBookmark,
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
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-zinc-700 hover:shadow-2xs">
      {/* Left: Status Icon & Metadata */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onShowDetails(torrent.id)}
          className={`mt-0.5 shrink-0 rounded-xl p-1 transition-all shadow-2xs ${
            isDownloaded
              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40"
              : isDownloading
              ? "bg-zinc-800/80 text-zinc-200 border border-zinc-700/80 hover:bg-zinc-700/80"
              : isWaiting
              ? "bg-zinc-800/80 text-zinc-300 border border-zinc-700/80 hover:bg-zinc-700/80"
              : isError
              ? "bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/40"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
          title={
            isDownloaded
              ? "Ready (Click to View Files)"
              : isDownloading
              ? `Downloading (${progress}%)`
              : isWaiting
              ? "Select Files"
              : isError
              ? torrent.status || "Error"
              : "View torrent files"
          }
        >
          {isDownloaded ? (
            <CheckCircleIcon size={32} weight="fill" />
          ) : isDownloading ? (
            <CircleNotchIcon size={32} className="animate-spin" />
          ) : isWaiting ? (
            <ListChecksIcon size={32} />
          ) : isError ? (
            <XCircleIcon size={32} weight="fill" />
          ) : (
            <FolderIcon size={32} />
          )}
        </Button>

        <div className="min-w-0 flex-1 space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onShowDetails(torrent.id)}
            className="h-auto w-full justify-start px-0 text-left text-sm font-medium text-foreground whitespace-normal transition-colors hover:text-zinc-300 leading-snug break-words"
            title={torrent.filename || torrent.id}
          >
            {torrent.filename || "Untitled Torrent"}
          </Button>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {torrent.bytes ? <span className="font-medium text-foreground/80">{formatBytes(torrent.bytes)}</span> : null}
            {torrent.bytes && torrent.added ? <span className="text-muted-foreground/40">•</span> : null}
            {torrent.added ? (
              <span>{new Date(torrent.added).toLocaleDateString()}</span>
            ) : null}
            {torrent.speed ? (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-mono font-medium text-zinc-300">
                  {formatBytes(torrent.speed)}/s
                </span>
              </>
            ) : null}
          </div>

          {/* Download Progress Bar */}
          {isDownloading && (
            <div className="w-full max-w-xs space-y-1 pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap sm:flex-nowrap shrink-0 items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <div className="flex items-center gap-2">
          {/* Main Action: View Files */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShowDetails(torrent.id)}
            className="gap-2 px-2.5 h-8 font-medium bg-zinc-900/60 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/80 hover:border-zinc-600 transition-colors rounded-lg"
            title="View Files & Details"
          >
            <FolderIcon size={16} className="text-zinc-400" />
            <span>Files</span>
          </Button>

          {/* Auxiliary Actions Group */}
          <ButtonGroup className="bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800">
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleBookmark(torrent)}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Torrent"}
                className={`h-8 px-2.5 rounded-md transition-all ${
                  isBookmarked
                    ? "text-violet-300 bg-violet-500/10 border border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-800/60"
                }`}
              >
                <BookmarkIcon size={16} weight={isBookmarked ? "fill" : "regular"} />
              </Button>
            )}

            {isDownloaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(torrent.id)}
                title="Download File"
                className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-zinc-800/60 rounded-md"
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
                className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-zinc-800/60 rounded-md"
              >
                {copied ? (
                  <CheckIcon size={16} className="text-emerald-400" />
                ) : (
                  <CopyIcon size={16} />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(torrent.id)}
              className="h-8 px-2.5 text-muted-foreground hover:bg-rose-950/40 hover:text-rose-300 rounded-md"
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
