import { useState, useEffect, useCallback } from "react";
import { GearIcon, CheckCircleIcon, XCircleIcon, CircleNotchIcon, KeyIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
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
            setSuccessMessage(`Connected as ${info.username} (${info.type.toUpperCase()})`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify API token.");
        } finally {
            setTesting(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        setTesting(true);
        setError(null);
        setSuccessMessage(null);
        setUserInfo(null);

        // Fetch current token directly from server to pick up any manual .env changes
        fetch("/api/getApiToken", { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                const serverToken = (data.result || "").trim();
                setApiToken(serverToken);
                if (serverToken) {
                    localStorage.setItem("rd_api_token", serverToken);
                    // Test the token without writing it to server config
                    preloadAPI.testApiToken(serverToken)
                        .then((info) => {
                            setUserInfo(info);
                            setSuccessMessage(`Connected as ${info.username} (${info.type.toUpperCase()})`);
                        })
                        .catch((err) => {
                            setError(err instanceof Error ? err.message : "Failed to verify API token.");
                        })
                        .finally(() => {
                            setTesting(false);
                        });
                } else {
                    setTesting(false);
                }
            })
            .catch(() => {
                // Fallback to local storage if API request fails
                const localToken = preloadAPI.getApiToken() || "";
                setApiToken(localToken);
                if (localToken) {
                    testToken(localToken);
                } else {
                    setTesting(false);
                }
            });
    }, [open, testToken]);

    const handleSave = () => {
        preloadAPI.setApiToken(apiToken);
        onSettingsSaved();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <GearIcon size={20} className="text-primary" />
                        Real-Debrid Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your Real-Debrid API token to access your account downloads and torrents.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>API Token</span>
                            <a
                                href="https://real-debrid.com/apitoken"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 normal-case font-normal"
                            >
                                Get API token <ArrowSquareOutIcon size={12} />
                            </a>
                        </label>
                        <div className="relative flex items-center">
                            <KeyIcon size={16} className="absolute left-3 text-muted-foreground" />
                            <Input
                                type="password"
                                value={apiToken}
                                onChange={(e) => {
                                    setApiToken(e.target.value);
                                    setError(null);
                                    setSuccessMessage(null);
                                }}
                                placeholder="Paste your Real-Debrid API token here"
                                className="w-full h-10 pl-9 pr-24 rounded-lg border-input bg-background font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() => testToken(apiToken)}
                                disabled={testing || !apiToken.trim()}
                                className="absolute right-1.5 h-7 px-2.5 text-xs"
                            >
                                {testing ? <CircleNotchIcon size={14} className="animate-spin" /> : "Test"}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
                            <XCircleIcon size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && userInfo && (
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                                <CheckCircleIcon size={16} className="shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                            <div className="text-[11px] opacity-80 pl-6">
                                Email: {userInfo.email} | Points: {userInfo.points} | Expires: {new Date(userInfo.expiration).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Token
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
