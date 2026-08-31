import {
    PlusIcon,
    GearIcon,
    ArrowsClockwiseIcon,
    HardDrivesIcon,
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    BookmarkIcon,
    ListDashesIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
    loading: boolean;
    searchQuery: string;
    activeTab?: "torrents" | "bookmarks";
    bookmarkCount?: number;
    onTabChange?: (tab: "torrents" | "bookmarks") => void;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    onOpenAddModal: () => void;
    onOpenSettingsModal: () => void;
    hasApiToken: boolean;
}

export function Header({
    loading,
    searchQuery,
    activeTab = "torrents",
    bookmarkCount = 0,
    onTabChange,
    onSearchChange,
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                            <HardDrivesIcon size={32} weight="bold" />
                        </div>
                        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-bold hidden xs:inline">
                            RD Browser
                        </span>
                    </div>

                    {/* Navigation Tabs */}
                    {onTabChange && (
                        <nav className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 ml-2">
                            <button
                                type="button"
                                onClick={() => onTabChange("torrents")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === "torrents"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <ListDashesIcon size={16} />
                                <span>Torrents</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onTabChange("bookmarks")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all relative ${
                                    activeTab === "bookmarks"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <BookmarkIcon size={16} weight={bookmarkCount > 0 ? "fill" : "regular"} className={bookmarkCount > 0 ? "text-amber-500" : ""} />
                                <span>Bookmarks</span>
                                {bookmarkCount > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                        {bookmarkCount}
                                    </span>
                                )}
                            </button>
                        </nav>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md hidden sm:block">
                    <MagnifyingGlassIcon
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search torrents..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-full border border-input bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                    />
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

            {/* Mobile Search Bar */}
            <div className="px-4 pb-3 sm:hidden">
                <div className="relative w-full">
                    <MagnifyingGlassIcon
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search torrents..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-full border border-input bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                    />
                </div>
            </div>
        </header>
    );
}
