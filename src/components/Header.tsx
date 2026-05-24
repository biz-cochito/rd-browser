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
            <button id="btn-refresh" onClick={onRefresh} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
            </button>
        </div>
    );
}
