import { useRef } from "preact/hooks";
import InputLinksDialog from "./InputLinksDialog";

interface HeaderButtonsProps {
    loading: boolean;
    onRefresh: () => void;
}

function HeaderButtons({ loading, onRefresh }: HeaderButtonsProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    function showInputLinksDialog() {
        dialogRef.current?.showModal();
    }

    return (
        <div
            id="btn-settings"
            class="input-group material-symbols"
            style={{ display: "inline" }}
        >
            <button
                id="btn-add"
                onClick={showInputLinksDialog}
                class="button primary"
                title="Add"
            >
                add_box
            </button>
            <InputLinksDialog dialogRef={dialogRef} />
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
                {loading ? "pending" : "refresh"}
            </button>
        </div>
    );
}

export default HeaderButtons;
