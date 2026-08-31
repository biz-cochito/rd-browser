import { useState, useEffect, useRef } from "react";
import { type DeviceCodeResponse, RealDebridClient } from "@/services/RealDebridClient";
import { preloadAPI } from "@/services/preloadAPI";
import { Button } from "@/components/ui/button";
import {
    QrCodeIcon,
    CircleNotchIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowSquareOutIcon,
    ArrowClockwiseIcon,
} from "@phosphor-icons/react";

interface DeviceAuthCardProps {
    onSuccess?: (token: string) => void;
}

export function DeviceAuthCard({ onSuccess }: DeviceAuthCardProps) {
    const [loading, setLoading] = useState(false);
    const [deviceData, setDeviceData] = useState<DeviceCodeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const stopTimers = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
    };

    const startDeviceFlow = async () => {
        stopTimers();
        setLoading(true);
        setError(null);
        setAuthorized(false);
        setDeviceData(null);

        try {
            const data = await RealDebridClient.getDeviceCode();
            setDeviceData(data);
            setTimeLeft(data.expires_in || 120);

            // Start countdown timer
            countdownRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopTimers();
                        setError("Code expired. Please generate a new code.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Start polling for authorization
            const intervalMs = (data.interval || 5) * 1000;
            pollingRef.current = setInterval(async () => {
                try {
                    const creds = await RealDebridClient.pollDeviceCredentials(data.device_code);
                    if (creds) {
                        stopTimers();
                        const tokenData = await RealDebridClient.getTokenFromCredentials(
                            creds.client_id,
                            creds.client_secret,
                            data.device_code,
                        );

                        if (tokenData.access_token) {
                            preloadAPI.setApiToken(tokenData.access_token);
                            setAuthorized(true);
                            if (onSuccess) {
                                onSuccess(tokenData.access_token);
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error polling device credentials:", err);
                }
            }, intervalMs);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to initiate device authorization.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(() => {
            if (isMounted) {
                startDeviceFlow();
            }
        });
        return () => {
            isMounted = false;
            stopTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const qrUrl = deviceData
        ? deviceData.direct_verification_url || `${deviceData.verification_url}?user_code=${deviceData.user_code}`
        : "";

    const qrImageUrl = qrUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`
        : "";

    return (
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs space-y-6 max-w-md mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-base">
                    <QrCodeIcon size={22} className="text-primary" />
                    <span>VR & Quick Device Login</span>
                </div>
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={startDeviceFlow}
                    disabled={loading}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    <ArrowClockwiseIcon size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>

            {loading && (
                <div className="py-10 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                    <CircleNotchIcon size={32} className="animate-spin text-primary" />
                    <span className="text-sm">Requesting code from Real-Debrid...</span>
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-4 text-xs text-destructive space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                        <XCircleIcon size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={startDeviceFlow}
                        className="mt-1 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {authorized && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
                    <CheckCircleIcon size={40} className="mx-auto text-emerald-500" />
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                        Successfully Authenticated!
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Your account has been connected. Loading your torrents...
                    </p>
                </div>
            )}

            {!loading && !error && !authorized && deviceData && (
                <div className="space-y-6 text-center">
                    {/* User Code */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            1. User Code
                        </span>
                        <div className="font-mono text-3xl font-bold tracking-widest text-primary bg-primary/10 py-3 px-4 rounded-xl border border-primary/20 select-all">
                            {deviceData.user_code}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="space-y-3 flex flex-col items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            2. Scan QR Code on Phone
                        </span>
                        <div className="bg-white p-3 rounded-2xl shadow-inner border border-border inline-block">
                            <img
                                src={qrImageUrl}
                                alt="Real-Debrid Login QR Code"
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="text-xs text-muted-foreground space-y-2 bg-muted/40 p-3 rounded-lg text-left border border-border/40">
                        <div className="font-medium text-foreground">How to authorize:</div>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            <li>Scan the QR code above with your smartphone camera.</li>
                            <li>
                                Or visit{" "}
                                <a
                                    href={deviceData.verification_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline font-mono inline-flex items-center gap-0.5"
                                >
                                    real-debrid.com/device <ArrowSquareOutIcon size={10} />
                                </a>{" "}
                                and enter code above.
                            </li>
                        </ol>
                    </div>

                    {/* Status Spinner */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                        <CircleNotchIcon size={16} className="animate-spin text-primary shrink-0" />
                        <span>Waiting for approval on phone/PC... ({timeLeft}s)</span>
                    </div>
                </div>
            )}
        </div>
    );
}
