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
            <DialogContent className="inset-4 top-4 left-4 w-auto max-w-none sm:max-w-none h-[calc(100vh-2rem)] max-h-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-4 gap-3 bg-card border-border">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <DialogTitle className="text-sm font-semibold truncate pr-4 flex items-center gap-2">
                        <PlayIcon size={18} className="text-primary shrink-0" />
                        <span className="truncate">{title || "Video Playback"}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Video container */}
                <div className="relative min-h-0 w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-border/50">
                    {hasError ? (
                        <div className="p-6 text-center space-y-3 max-w-md">
                            <p className="text-xs text-muted-foreground">
                                Your browser cannot play this video format directly (it may use MKV, AC3 audio, or unsupported codecs).
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <Button variant="secondary" size="sm" onClick={handleOpenExternal}>
                                    <ArrowSquareOutIcon size={16} className="mr-1.5" />
                                    Open Direct Link
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                                    <CopyIcon size={16} className="mr-1.5" />
                                    Copy Link for VLC / MPV
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

                {/* Footer Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                    <span className="truncate max-w-[50%] font-mono text-[11px]">
                        {videoUrl}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="xs" onClick={handleCopyUrl}>
                            {copied ? (
                                <CheckIcon size={14} className="text-emerald-500 mr-1" />
                            ) : (
                                <CopyIcon size={14} className="mr-1" />
                            )}
                            {copied ? "Copied!" : "Copy Stream Link"}
                        </Button>
                        <Button variant="secondary" size="xs" onClick={handleOpenExternal}>
                            <ArrowSquareOutIcon size={14} className="mr-1" />
                            Open External
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
