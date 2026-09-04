interface AppIconProps {
    className?: string;
    size?: number;
}

export function AppIcon({ className = "", size = 36 }: AppIconProps) {
    return (
        <div
            style={{ width: size, height: size }}
            className={`flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 font-mono font-bold tracking-tight shadow-2xs select-none shrink-0 ${className}`}
        >
            <div className="flex items-baseline font-black tracking-tighter text-xs">
                <span>rdb</span>
                <span className="w-1 h-1 rounded-full bg-violet-400 ml-0.5" />
            </div>
        </div>
    );
}
