function dbg_continue() {
    if (program_running) {
        cursorSet(cont_bttn, "not-allowed")
        cursorSet(document.body, "wait")
        bttonColor(cont_bttn, "lightgray")
        stepLineHide()
        wasm_worker.postMessage("CONT")
    }
}