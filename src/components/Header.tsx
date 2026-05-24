import logo from "@assets/rdb-logo.svg";

interface HeaderProps {
    loading: boolean;
    onRefresh: () => void;
}

export function Header({ loading, onRefresh }: HeaderProps) {
    return (
        <div class="header">
            <span>
                <img src={logo} alt="Real-Debrid" style="height: 32px;" />
            </span>
            <div
                id="btn-settings"
                class="input-group material-symbols"
                style="display: inline;"
            >
                <button id="btn-add" class="button primary" title="Add">
                    add_box
                </button>
                <button class="tertiary button" title="Settings">
                    settings
                </button>
                <button
                    class="button primary material-symbols"
                    id="btn-refresh"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh"
                >
                    {loading ? "Loading..." : "refresh"}
                </button>
            </div>
        </div>
    );
}
