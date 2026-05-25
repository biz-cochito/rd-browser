import logo from "@assets/rdb-logo.svg";
import HeaderButtons from "./HeaderButtons";

interface HeaderProps {
    loading: boolean;
    onRefresh: () => void;
}

export function Header({ loading, onRefresh }: HeaderProps) {
    return (
        <header class="header w-full left-0">
            <div class="logo">
                <img src={logo} alt="Real-Debrid" />
            </div>
            <HeaderButtons loading={loading} onRefresh={onRefresh} />
        </header>
    );
}
