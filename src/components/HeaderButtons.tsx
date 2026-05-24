import InputLinksDialog from "./InputLinksDialog";

interface HeaderButtonsProps {
  loading: boolean;
  onRefresh: () => void;
}

function HeaderButtons({ loading, onRefresh }: HeaderButtonsProps) {
  function showInputLinksDialog() {
    const modal = document.getElementById("input-links-dialog") as HTMLDialogElement | null;
    modal?.showModal();
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
      <InputLinksDialog />
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
