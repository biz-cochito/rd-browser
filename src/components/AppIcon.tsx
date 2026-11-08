interface AppIconProps {
  className?: string;
  size?: number;
}

export function AppIcon({ className = "", size = 32 }: AppIconProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-[8px] bg-ink text-canvas font-mono select-none shrink-0 border border-hairline ${className}`}
    >
      <div className="flex items-baseline font-medium tracking-tight text-[12px] leading-none">
        <span>rd</span>
        <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
      </div>
    </div>
  );
}
