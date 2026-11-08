import { useState, useRef, useEffect } from "react";
import {
  CopyIcon,
  CheckIcon,
  ArrowSquareOutIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPlayerModalProps {
  open: boolean;
  videoUrl: string;
  title: string;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerModal({
  open,
  videoUrl,
  title,
  onOpenChange,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => setHasError(false));
    }
  }, [open, videoUrl]);

  const handleCopyUrl = async () => {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-4 top-4 left-4 w-auto max-w-none sm:max-w-none h-[calc(100vh-2rem)] max-h-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-5 gap-4 bg-surface-card border-hairline">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-10">
          <DialogTitle className="typo-title-sm truncate flex items-center gap-2.5 text-ink">
            <span className="timeline-pill timeline-pill-read">Stream</span>
            <span className="truncate font-mono text-[13px] font-normal">
              {title || "Video Playback"}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Video container */}
        <div className="relative min-h-0 w-full h-full bg-[#12110e] rounded-[8px] overflow-hidden flex items-center justify-center border border-hairline">
          {hasError ? (
            <div className="p-8 text-center space-y-4 max-w-md rounded-[12px] border border-hairline bg-surface-card text-ink">
              <div className="inline-flex size-10 items-center justify-center rounded-[8px] border border-hairline bg-canvas-soft">
                <PlayIcon size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="typo-title-sm text-ink">
                  External Player Recommended
                </h4>
                <p className="typo-body-sm text-body">
                  This stream uses a container or audio codec (such as MKV or
                  AC-3) that cannot be decoded natively in the browser.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenExternal}
                >
                  <ArrowSquareOutIcon size={15} />
                  <span>Open Direct Stream</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleCopyUrl}>
                  <CopyIcon size={15} />
                  <span>Copy URL for VLC / MPV</span>
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              onError={() => setHasError(true)}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Footer IDE-pane Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-hairline bg-canvas-soft px-3.5 py-2.5">
          <span className="truncate max-w-[55%] font-mono text-[12px] text-body">
            {videoUrl}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="xs" onClick={handleCopyUrl}>
              {copied ? (
                <CheckIcon
                  size={13}
                  weight="bold"
                  className="text-semantic-success"
                />
              ) : (
                <CopyIcon size={13} />
              )}
              <span>{copied ? "Copied" : "Copy Stream URL"}</span>
            </Button>
            <Button variant="download" size="xs" onClick={handleOpenExternal}>
              <ArrowSquareOutIcon size={13} />
              <span>Open External</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
