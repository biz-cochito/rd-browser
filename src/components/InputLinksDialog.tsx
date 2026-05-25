import { RefObject } from "preact";

interface InputLinksDialogProps {
  dialogRef: RefObject<HTMLDialogElement>;
}

function InputLinksDialog({ dialogRef }: InputLinksDialogProps) {
  function hideInputLinksDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog ref={dialogRef} id="input-links-dialog" class="modal">
      <div class="modal-header material-symbols">
        <span class="title">Paste links below:</span>
        <button
          id="btn-cancel-input-links"
          class="button secondary"
          onClick={hideInputLinksDialog}
        >
          close
        </button>
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
