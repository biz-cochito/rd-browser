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
                class="input-group"
                style="display: inline;"
            >
                <button id="btn-add" class="button primary" title="Add">
                    <i class="icon add_box"></i>
                </button>
                <button class="tertiary button" title="Settings">
                    <i class="icon settings"></i>
                </button>
                <button
                    class="button primary"
                    id="btn-refresh"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh"
                >
                    {loading ? "Loading..." : <i class="icon refresh"></i>}
                </button>
            </div>
        </div>
    );
}
