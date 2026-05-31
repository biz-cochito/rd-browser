import { useEffect, useRef } from "preact/hooks";
import { createPlayer } from "@videojs/react";
import { Video, VideoSkin, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/skin.css";

const player = createPlayer({
    features: videoFeatures,
});

interface VideoPlayerModalProps {
    isOpen: boolean;
    videoUrl: string;
    title: string;
    onClose: () => void;
}

export function VideoPlayerModal({
    isOpen,
    videoUrl,
    title,
    onClose,
}: VideoPlayerModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    // Handle browser back button or escape key canceling
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleCancel = (e: Event) => {
            e.preventDefault();
            onClose();
        };

        dialog.addEventListener("cancel", handleCancel);
        return () => {
            dialog.removeEventListener("cancel", handleCancel);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <dialog
            ref={dialogRef}
            class="video-player-dialog m-auto"
            style={{
                width: "90%",
                maxWidth: "1000px",
                padding: "0",
                background: "#0f0f11",
                border: "1px solid #27272a",
                borderRadius: "4px",
                color: "#fafafa",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                outline: "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderBottom: "1px solid #27272a",
                    background: "transparent",
                }}
            >
                <button
                    onClick={onClose}
                    class="button secondary"
                    style={{
                        padding: "6px 14px",
                        margin: 0,
                        height: "auto",
                        minWidth: "auto",
                        background: "transparent",
                        border: "1px solid #3f3f46",
                        color: "#d4d4d8",
                        fontSize: "0.875rem",
                        transition: "all 0.15s ease",
                    }}
                >
                    Close
                </button>
            </div>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    background: "transparent",
                }}
            >
                <player.Provider>
                    <player.Container style={{ width: "100%", height: "100%" }}>
                        <VideoSkin>
                            <Video
                                src={videoUrl}
                                autoPlay
                                playsInline
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </VideoSkin>
                    </player.Container>
                </player.Provider>
            </div>
        </dialog>
    );
}
