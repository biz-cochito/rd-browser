function BtnCloseDialog() {
  function hideInputLinksDialog() {
    const modal = document.getElementById(
      "input-links-dialog",
    ) as HTMLDialogElement;
    modal.close();
  }
  return (
    <button
      id="btn-cancel-input-links"
      class="button secondary"
      onClick={hideInputLinksDialog}
    >
      cancel
    </button>
  );
}

function InputLinksDialog() {
  return (
    <dialog id="input-links-dialog" class="modal">
      <div class="modal-header material-symbols">
        <span class="title">Paste links below:</span>
        <BtnCloseDialog />
      </div>
      <textarea id="input-links" class="input"></textarea>
      <div class="modal-footer fluid input-group material-symbols">
        <button
          aria-label="Add links"
          id="btn-add-input-links"
          class="button tertiary"
        >
          <div>
          <span class="material-symbols">add_box</span>
          <span class="text"> Add links</span>
          </div>
        </button>
      </div>
    </dialog>
  );
}

export default InputLinksDialog;
