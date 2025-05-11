function dbg_continue() {
    if (program_running) {
        cursorSet("wait")
        contBttonColor("white")
        stepLineHide()
        wasm_worker.postMessage("CONT")
    }
}