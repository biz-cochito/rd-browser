import { useState, useEffect, useRef } from "react";
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

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  interval: number;
  expires_in: number;
  verification_url: string;
  direct_verification_url?: string;
}

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
      const data = await preloadAPI.getDeviceCode();
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
          const creds = await preloadAPI.checkDeviceCredentials(
            data.device_code,
          );
          if (creds && creds.success && creds.token) {
            stopTimers();
            preloadAPI.setApiToken(creds.token);
            setAuthorized(true);
            if (onSuccess) {
              onSuccess(creds.token);
            }
          }
        } catch (err) {
          console.error("Error polling device credentials:", err);
        }
      }, intervalMs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate device authorization.",
      );
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
    ? deviceData.direct_verification_url ||
      `${deviceData.verification_url}?user_code=${deviceData.user_code}`
    : "";

  const qrImageUrl = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`
    : "";

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-[12px] border border-hairline bg-surface-card">
      {/* Top IDE-style pane bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-canvas-soft px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <QrCodeIcon size={18} className="text-ink" />
          <span className="typo-title-sm text-ink">
            Device & VR Quick Authorization
          </span>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={startDeviceFlow}
          disabled={loading}
        >
          <ArrowClockwiseIcon
            size={13}
            className={loading ? "animate-spin" : ""}
          />
          <span>New Code</span>
        </Button>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-3 py-12 text-body">
            <CircleNotchIcon size={28} className="animate-spin text-ink" />
            <span className="font-mono text-[13px]">
              Requesting device token from Real-Debrid...
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-[8px] border border-semantic-error/30 bg-semantic-error/8 p-4 text-[13px] text-semantic-error space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <XCircleIcon size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="xs" variant="destructive" onClick={startDeviceFlow}>
              Try Again
            </Button>
          </div>
        )}

        {authorized && (
          <div className="rounded-[12px] border border-semantic-success/30 bg-semantic-success/8 p-8 text-center space-y-3">
            <CheckCircleIcon
              size={36}
              weight="fill"
              className="mx-auto text-semantic-success"
            />
            <div className="typo-display-sm text-ink">
              Device Authenticated
            </div>
            <p className="typo-body-sm text-body">
              Your Real-Debrid account is connected. Synchronizing torrents...
            </p>
          </div>
        )}

        {!loading && !error && !authorized && deviceData && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
            {/* Left pane: User Code & Steps */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="timeline-pill timeline-pill-thinking">
                    Step 01
                  </span>
                  <span className="typo-caption-uppercase text-muted-text">
                    Authorization Code
                  </span>
                </div>
                <div className="rounded-[12px] border border-hairline bg-canvas-soft px-4 py-4 text-center font-mono text-[28px] font-medium tracking-[0.2em] text-ink select-all">
                  {deviceData.user_code}
                </div>
              </div>

              <div className="rounded-[8px] border border-hairline-soft bg-canvas-soft p-4 space-y-2.5">
                <div className="typo-caption-uppercase text-ink">
                  How to connect
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[13px] text-body leading-relaxed">
                  <li>Scan the QR code with your phone camera.</li>
                  <li>
                    Or open{" "}
                    <a
                      href={deviceData.verification_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[12px] text-ink underline underline-offset-3 hover:text-primary inline-flex items-center gap-1"
                    >
                      real-debrid.com/device
                      <ArrowSquareOutIcon size={11} />
                    </a>{" "}
                    and enter the code above.
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 font-mono text-[12px] text-muted-text">
                <CircleNotchIcon
                  size={14}
                  className="animate-spin text-primary shrink-0"
                />
                <span>Awaiting confirmation ({timeLeft}s remaining)</span>
              </div>
            </div>

            {/* Right pane: QR Code */}
            <div className="flex flex-col items-center justify-center rounded-[12px] border border-hairline bg-canvas-soft p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="timeline-pill timeline-pill-read">
                  Step 02
                </span>
                <span className="typo-caption-uppercase text-muted-text">
                  Scan QR
                </span>
              </div>
              <div className="rounded-[12px] border border-hairline bg-white p-3">
                <img
                  src={qrImageUrl}
                  alt="Real-Debrid Login QR Code"
                  className="size-44 object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
