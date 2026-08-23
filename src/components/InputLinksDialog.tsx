import { useState } from "react";
import { PlusIcon, LinkIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface InputLinksDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddLinks: (text: string) => Promise<void>;
}

export function InputLinksDialog({
    open,
    onOpenChange,
    onAddLinks,
}: InputLinksDialogProps) {
    const [linksText, setLinksText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        if (!submitting) {
            setError(null);
            setLinksText("");
            onOpenChange(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linksText.trim()) {
            setError("Please enter at least one magnet link or torrent URL.");
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await onAddLinks(linksText);
            setLinksText("");
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add links.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <LinkIcon size={20} className="text-primary" />
                        Add Torrent Links
                    </DialogTitle>
                    <DialogDescription>
                        Paste magnet links or torrent URLs below (one per line) to convert and download via Real-Debrid.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    {error && (
                        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <Textarea
                        id="input-links"
                        placeholder="magnet:?xt=urn:btih:..."
                        value={linksText}
                        onChange={(e) => setLinksText(e.target.value)}
                        disabled={submitting}
                        rows={6}
                        className="font-mono text-xs resize-none"
                        autoFocus
                    />

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !linksText.trim()}>
                            {submitting ? (
                                <>
                                    <CircleNotchIcon size={18} className="animate-spin mr-1.5" />
                                    Adding Links...
                                </>
                            ) : (
                                <>
                                    <PlusIcon size={18} className="mr-1.5" weight="bold" />
                                    Add Links
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
