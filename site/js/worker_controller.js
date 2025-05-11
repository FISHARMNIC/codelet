/*

Todo: only recompile if you modify the textarea

*/

if (!Worker) {
    window.alert("Browser does not support workers")
}

const wasm_worker = new Worker("js/worker/worker.js", { type: "module" })

wasm_worker.onerror = (e) => {
    console.error("WORKER ERR", e)
    window.alert("[INTERNAL] Worker failed to launch")
}

var program_running = false
var datamap;
var dbg_lineNo = 0;

wasm_worker.onmessage = (message) => {
    var data = message.data
    var command = data.command
    if (command == "PRINT") {
        console.log(data.data)
    }
    else if (command == "PAUSE") {

        cursorSet(cont_bttn, "pointer")

        bttonColor(cont_bttn, "orange")

        dbg_lineNo = data.data
        stepLineShow(dbg_lineNo)

        cursorSet(document.body, "default")
    }
    else if (command == "COMPILE_START") {
        console.log("::: Compiling...\n")
        cursorSet(document.body, "wait")
    }
    else if (command == "COMPILE_DONE") {
        console.log("::: Running...\n")

        cursorSet(document.body, "default")
        cursorSet(play_bttn, "not-allowed")
        bttonColor(play_bttn, "lightgray")
        bttonColor(pause_bttn, "salmon")

        program_running = true
    }
    else if (command == "PROGRAM_EXIT") {
        cursorSet(cont_bttn, "not-allowed")

        console.log("\n::: Exited!\n")

        cursorSet(document.body, "default")
        cursorSet(play_bttn, "pointer")
        bttonColor(play_bttn, "lightgreen")
        bttonColor(pause_bttn, "lightgray")

        stepLineHide()

        editor.options.readOnly = false

        program_running = false
    }
    else if (command == "MEMORY") {
        memory.innerHTML = data.mem
        document.getElementById("scrollInto")?.scrollIntoView()
    }
    else if (command == "MEMVIEW") {
        if(data.mode == 0)
        {
            vb1.style.backgroundColor = "var(--env-dark)"
            vb2.style.backgroundColor = "var(--env-medium)"
        }
        else
        {
            vb2.style.backgroundColor = "var(--env-dark)"
            vb1.style.backgroundColor = "var(--env-medium)"
        }
    }
    else {
        console.log("UNKOWN COMMAND", command)
        stepLineShow(lineNo)
    }
}

function formatCommand(command, info) {
    return { command, ...info }
}

function compile() {
    const textContent = editor.doc.getValue().split("\n")

    terminal.value = ""

    editor.options.readOnly = true

    wasm_worker.postMessage(formatCommand("COMPILE", { textContent }))
}