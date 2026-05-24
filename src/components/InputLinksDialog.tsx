

function InputLinksDialog() {
    function hideInputLinksDialog() {
        const modal = document.getElementById("input-links-dialog") as HTMLDialogElement;
        modal.close();
    }
    return (
        <dialog id="input-links-dialog" class="modal">
            <h4 class="title">Paste links below:</h4>
            <textarea id="input-links" class="input"></textarea>
            <div class="modal-footer fluid input-group material-symbols">
                <button 
                    id="btn-cancel-input-links"
                    class="button secondary"
                    onClick={hideInputLinksDialog}>cancel</button>
                <button aria-label="Add links" id="btn-add-input-links" class="button tertiary">add_box</button>
            </div>
        </dialog>
    )
}

export default InputLinksDialog