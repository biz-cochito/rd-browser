interface HeaderButtonsProps {
    loading: boolean;
    onRefresh: () => void;
}

function HeaderButtons({ loading, onRefresh }: HeaderButtonsProps) {
    return (
        <div
            id="btn-settings"
            class="input-group material-symbols"
            style={{ display: "inline" }}
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
    )
}

export default HeaderButtons;