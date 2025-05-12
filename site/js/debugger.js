function dbg_continue() {
    if (program_running) {
        cursorSet(cont_bttn, "not-allowed")
        cursorSet(document.body, "wait")
        bttonColor(cont_bttn, "lightgray")
        stepLineHide()
        wasm_worker.postMessage("CONT")
    }
}

function dbg_unpause() {
    if (program_running) {
        wasm_worker.postMessage("PAUSEMODE")
        if (pause_bttn.className == "fa fa-stop") {
            pause_bttn.className = "fa fa-pause"
            pause_bttn.title = "Resume single-step mode"
        }
        else {
            pause_bttn.className = "fa fa-stop"
            pause_bttn.title = "Unpause the program and run without stepping"
        }
    }
}