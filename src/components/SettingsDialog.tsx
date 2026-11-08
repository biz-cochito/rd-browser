import { useState, useEffect, useCallback } from "react";
import {
  GearIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  KeyIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { preloadAPI } from "@/services/preloadAPI";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsSaved: () => void;
}

interface UserAccountInfo {
  username: string;
  email: string;
  type: string;
  expiration: string;
  points: number;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onSettingsSaved,
}: SettingsDialogProps) {
  const [apiToken, setApiToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserAccountInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const testToken = useCallback(async (tokenToTest: string) => {
    if (!tokenToTest.trim()) return;
    setTesting(true);
    setError(null);
    setUserInfo(null);
    setSuccessMessage(null);
    try {
      const info = await preloadAPI.testApiToken(tokenToTest);
      setUserInfo(info);
      setSuccessMessage(
        `Connected as ${info.username} (${info.type.toUpperCase()})`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify API token.",
      );
    } finally {
      setTesting(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setTesting(true);
      setError(null);
      setSuccessMessage(null);
      setUserInfo(null);
    });

    fetch("/api/getApiToken", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const serverToken = (data.result || "").trim();
        setApiToken(serverToken);
        if (serverToken) {
          localStorage.setItem("rd_api_token", serverToken);
          preloadAPI
            .testApiToken(serverToken)
            .then((info) => {
              if (cancelled) return;
              setUserInfo(info);
              setSuccessMessage(
                `Connected as ${info.username} (${info.type.toUpperCase()})`,
              );
            })
            .catch((err) => {
              if (cancelled) return;
              setError(
                err instanceof Error
                  ? err.message
                  : "Failed to verify API token.",
              );
            })
            .finally(() => {
              if (!cancelled) setTesting(false);
            });
        } else {
          setTesting(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const localToken = preloadAPI.getApiToken() || "";
        setApiToken(localToken);
        if (localToken) {
          testToken(localToken);
        } else {
          setTesting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, testToken]);

  const handleSave = () => {
    preloadAPI.setApiToken(apiToken);
    onSettingsSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="badge-pill">Configuration</span>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <GearIcon size={20} className="text-ink" />
            <span>Real-Debrid Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure your personal Real-Debrid API token to authenticate
            requests and unrestrict links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="rd-api-token"
                className="typo-caption-uppercase text-muted-text"
              >
                API Token
              </label>
              <a
                href="https://real-debrid.com/apitoken"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[12px] text-ink underline underline-offset-3 hover:text-primary"
              >
                real-debrid.com/apitoken
                <ArrowSquareOutIcon size={12} />
              </a>
            </div>
            <div className="relative flex items-center">
              <KeyIcon
                size={16}
                className="pointer-events-none absolute left-3.5 text-muted-text"
              />
              <Input
                id="rd-api-token"
                type="password"
                value={apiToken}
                onChange={(e) => {
                  setApiToken(e.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder="Paste your Real-Debrid API token..."
                className="h-11 w-full bg-canvas-soft pl-10 pr-20 font-mono text-[13px]"
              />
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => testToken(apiToken)}
                disabled={testing || !apiToken.trim()}
                className="absolute right-2"
              >
                {testing ? (
                  <CircleNotchIcon size={13} className="animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[8px] border border-semantic-error/30 bg-semantic-error/8 p-3 text-[13px] text-semantic-error">
              <XCircleIcon size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && userInfo && (
            <div className="rounded-[8px] border border-hairline bg-canvas-soft p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-semantic-success">
                  <CheckCircleIcon size={16} weight="fill" className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <span className="timeline-pill timeline-pill-grep">
                  Verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-hairline-soft pt-2.5 font-mono text-[12px]">
                <div>
                  <span className="block text-[10px] uppercase text-muted-text">
                    Email
                  </span>
                  <span className="truncate block text-ink">
                    {userInfo.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-muted-text">
                    Fidelity
                  </span>
                  <span className="text-ink">{userInfo.points} pts</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-muted-text">
                    Expires
                  </span>
                  <span className="text-ink">
                    {new Date(userInfo.expiration).toISOString().slice(0, 10)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
