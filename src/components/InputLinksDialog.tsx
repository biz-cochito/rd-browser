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
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="timeline-pill timeline-pill-thinking">
              Queue Input
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon size={20} className="text-ink" />
            <span>Add Magnet Links</span>
          </DialogTitle>
          <DialogDescription>
            Paste magnet URIs or info-hashes below (one per line) to resolve and
            cache on Real-Debrid.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[8px] border border-semantic-error/30 bg-semantic-error/8 p-3 text-[13px] text-semantic-error">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-links"
                className="typo-caption-uppercase text-muted-text"
              >
                Magnet URIs / Hashes
              </label>
              <span className="font-mono text-[11px] text-muted-text">
                1 link per line
              </span>
            </div>
            <Textarea
              id="input-links"
              placeholder="magnet:?xt=urn:btih:..."
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              disabled={submitting}
              rows={6}
              className="font-mono text-[13px] resize-none"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !linksText.trim()}>
              {submitting ? (
                <>
                  <CircleNotchIcon size={16} className="animate-spin" />
                  <span>Adding Links...</span>
                </>
              ) : (
                <>
                  <PlusIcon size={16} weight="bold" />
                  <span>Add Links</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
