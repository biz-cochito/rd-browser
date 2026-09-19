import {
    PlusIcon,
    GearIcon,
    ArrowsClockwiseIcon,
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    BookmarkIcon,
    ListDashesIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";
import { useTheme } from "@/components/theme-provider";
import { AppIcon } from "@/components/AppIcon";

interface HeaderProps {
    loading: boolean;
    searchQuery: string;
    hideFailed: boolean;
    activeTab?: "torrents" | "bookmarks";
    bookmarkCount?: number;
    onTabChange?: (tab: "torrents" | "bookmarks") => void;
    onSearchChange: (query: string) => void;
    onHideFailedChange: (hide: boolean) => void;
    onRefresh: () => void;
    onOpenAddModal: () => void;
    onOpenSettingsModal: () => void;
    hasApiToken: boolean;
}

export function Header({
    loading,
    searchQuery,
    hideFailed,
    activeTab = "torrents",
    bookmarkCount = 0,
    onTabChange,
    onSearchChange,
    onHideFailedChange,
    onRefresh,
    onOpenAddModal,
    onOpenSettingsModal,
    hasApiToken,
}: HeaderProps) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3 font-semibold text-lg tracking-tight">
                    <div className="flex items-center gap-2.5">
                        <AppIcon size={34} />
                        <span className="font-bold text-foreground tracking-tight hidden xs:inline">
                            RD Browser
                        </span>
                    </div>

                    {/* Navigation Tabs */}
                    {onTabChange && (
                        <nav className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTabChange("torrents")}
                                aria-current={activeTab === "torrents" ? "page" : undefined}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    activeTab === "torrents"
                                        ? "bg-card text-foreground border border-border shadow-2xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                <ListDashesIcon size={16} />
                                <span>Torrents</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTabChange("bookmarks")}
                                aria-current={activeTab === "bookmarks" ? "page" : undefined}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all relative ${
                                    activeTab === "bookmarks"
                                        ? "bg-card text-foreground border border-border shadow-2xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                <BookmarkIcon size={16} weight={bookmarkCount > 0 ? "fill" : "regular"} className={bookmarkCount > 0 ? "text-violet-300" : ""} />
                                <span>Bookmarks</span>
                                {bookmarkCount > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 text-[10px] font-semibold">
                                        {bookmarkCount}
                                    </span>
                                )}
                            </Button>
                        </nav>
                    )}
                </div>

                {/* Search Bar & Filters */}
                <div className="flex-1 max-w-md hidden sm:flex items-center gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            type="text"
                            placeholder="Search torrents..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-full border border-input bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                        />
                    </div>
                    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={hideFailed}
                            onChange={(e) => onHideFailedChange(e.target.checked)}
                            className="rounded border-input bg-muted accent-primary cursor-pointer w-3.5 h-3.5"
                        />
                        Hide failed
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onOpenAddModal}
                        className="gap-1.5 font-medium shadow-sm"
                    >
                        <PlusIcon size={18} weight="bold" />
                        <span className="hidden xs:inline">Add Links</span>
                    </Button>

                    <ButtonGroup orientation="horizontal">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={onRefresh}
                            disabled={loading}
                            title="Refresh list"
                        >
                            <ArrowsClockwiseIcon
                                size={18}
                                className={loading ? "animate-spin text-primary" : ""}
                            />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={onOpenSettingsModal}
                            title="Settings"
                            className={!hasApiToken ? "border-destructive text-destructive animate-pulse" : ""}
                        >
                            <GearIcon size={18} />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={toggleTheme}
                            title="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <SunIcon size={18} className="text-amber-400" />
                            ) : (
                                <MoonIcon size={18} className="text-slate-700" />
                            )}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {/* Mobile Search Bar & Filters */}
            <div className="px-4 pb-3 sm:hidden space-y-2">
                <div className="relative w-full">
                    <MagnifyingGlassIcon
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="text"
                        placeholder="Search torrents..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-full border border-input bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                    />
                </div>
                <div className="flex justify-end px-1">
                    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={hideFailed}
                            onChange={(e) => onHideFailedChange(e.target.checked)}
                            className="rounded border-input bg-muted accent-primary cursor-pointer w-3.5 h-3.5"
                        />
                        Hide failed
                    </label>
                </div>
            </div>
        </header>
    );
}
