import {
  PlusIcon,
  GearIcon,
  ArrowsClockwiseIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BookmarkSimpleIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";
import { useTheme } from "@/components/theme-provider";
import { AppIcon } from "@/components/AppIcon";

interface HeaderProps {
  loading: boolean;
  searchQuery: string;
  showCompletedOnly: boolean;
  activeTab?: "torrents" | "bookmarks";
  bookmarkCount?: number;
  onTabChange?: (tab: "torrents" | "bookmarks") => void;
  onSearchChange: (query: string) => void;
  onShowCompletedOnlyChange: (show: boolean) => void;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  hasApiToken: boolean;
}

export function Header({
  loading,
  searchQuery,
  showCompletedOnly,
  activeTab = "torrents",
  bookmarkCount = 0,
  onTabChange,
  onSearchChange,
  onShowCompletedOnlyChange,
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
    <header className="sticky top-0 z-30 w-full border-b border-hairline bg-canvas/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand Wordmark & Primary Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <AppIcon size={30} />
            <div className="hidden xs:flex items-baseline gap-2">
              <span className="text-[17px] font-normal tracking-[-0.35px] text-ink">
                RD Browser
              </span>
              <span className="hidden md:inline-block font-mono text-[11px] text-muted-text">
                v2.0
              </span>
            </div>
          </div>

          {onTabChange && (
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-1 border-l border-hairline pl-4 sm:pl-6"
            >
              <button
                type="button"
                onClick={() => onTabChange("torrents")}
                aria-current={activeTab === "torrents" ? "page" : undefined}
                className={`typo-nav-link inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 transition-colors cursor-pointer ${
                  activeTab === "torrents"
                    ? "bg-surface-card text-ink border border-hairline"
                    : "text-body hover:text-ink hover:bg-surface-strong/40 border border-transparent"
                }`}
              >
                <HardDrivesIcon size={24} />
                <span>Torrents</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("bookmarks")}
                aria-current={activeTab === "bookmarks" ? "page" : undefined}
                className={`typo-nav-link inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 transition-colors cursor-pointer ${
                  activeTab === "bookmarks"
                    ? "bg-surface-card text-ink border border-hairline"
                    : "text-body hover:text-ink hover:bg-surface-strong/40 border border-transparent"
                }`}
              >
                <BookmarkSimpleIcon
                  size={24}
                  weight={bookmarkCount > 0 ? "fill" : "regular"}
                />
                <span>Bookmarks</span>
                {bookmarkCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-surface-strong px-2 py-0.5 font-mono text-[11px] font-semibold leading-none text-ink">
                    {bookmarkCount}
                  </span>
                )}
              </button>
            </nav>
          )}
        </div>

        {/* Center: Search & Filter */}
        <div className="hidden flex-1 max-w-md lg:flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={24}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text"
            />
            <Input
              type="text"
              placeholder="Filter by filename or hash..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-[8px] border-hairline bg-surface-card pl-9 pr-3 font-mono text-[13px] text-ink placeholder:font-sans placeholder:text-muted-soft focus-visible:border-hairline-strong"
            />
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[13px] text-body hover:text-ink cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={showCompletedOnly}
              onChange={(e) => onShowCompletedOnlyChange(e.target.checked)}
              className="size-4 rounded-[4px] border-hairline-strong bg-surface-card accent-primary cursor-pointer"
            />
            <span>Show only completed</span>
          </label>
        </div>

        {/* Right: Primary CTA & Utility Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={onOpenAddModal}
            className="h-9 px-3.5 sm:h-10 sm:px-[18px]"
          >
            <PlusIcon size={24} weight="bold" />
            <span className="hidden xs:inline">Add Links</span>
          </Button>

          <ButtonGroup orientation="horizontal">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh torrents"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <ArrowsClockwiseIcon
                size={24}
                className={loading ? "animate-spin text-primary" : "text-ink"}
              />
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={onOpenSettingsModal}
              title="Real-Debrid API Settings"
              className={`h-9 w-9 sm:h-10 sm:w-10 relative ${
                !hasApiToken ? "border-primary text-primary" : ""
              }`}
            >
              <GearIcon size={24} />
              {!hasApiToken && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              title="Toggle appearance (D)"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              {theme === "dark" ? (
                <SunIcon size={24} className="text-ink" />
              ) : (
                <MoonIcon size={24} className="text-ink" />
              )}
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Tablet / Mobile Search & Filter Bar */}
      <div className="border-t border-hairline-soft bg-canvas px-4 py-2.5 lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={24}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
            />
            <Input
              type="text"
              placeholder="Filter by filename or hash..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-[8px] border-hairline bg-surface-card pl-9 pr-3 font-mono text-[13px]"
            />
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-body hover:text-ink cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={showCompletedOnly}
              onChange={(e) => onShowCompletedOnlyChange(e.target.checked)}
              className="size-3.5 rounded-[4px] border-hairline-strong bg-surface-card accent-primary cursor-pointer"
            />
            <span>Show only completed</span>
          </label>
        </div>
      </div>
    </header>
  );
}
