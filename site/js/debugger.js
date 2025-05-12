function dbg_continue() {
    if (program_running) {
        cursorSet(cont_bttn, "not-allowed")
        cursorSet(document.body, "wait")
        bttonColor(cont_bttn, "lightgray")
        stepLineHide()
        wasm_worker.postMessage("CONT")
    }
}

function dbg_unpause(force = false) {
    function deflt() {
        pause_bttn.style.color = "lightgreen"
        pause_bttn.className = "fa fa-play"
        pause_bttn.title = "Unpause the program and run without stepping"
        cont_bttn.title = "Step to the next line"
    }

    if (force) {
        deflt()
    }
    else if (program_running) {
        if (pause_bttn.className == "fa fa-play") {
            pause_bttn.style.color = "salmon"
            pause_bttn.className = "fa fa-pause"
            pause_bttn.title = "Resume single-step mode"
            cont_bttn.title = "Continue execution"
            wasm_worker.postMessage("NOSTEPMODE")
        }
        else {
            deflt()
            wasm_worker.postMessage("STEPMODE")
        }
    }
}