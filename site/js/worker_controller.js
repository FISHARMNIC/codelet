/*

Todo: only recompile if you modify the textarea

*/

const wasm_worker = new Worker("js/worker/worker.js", { type: "module" })

wasm_worker.onerror = (e) => {
    console.error("WORKER ERR", e)
}

var program_running = false

wasm_worker.onmessage = (message) => {
    var data = message.data
    var command = data.command
    if (command == "PRINT") {
        console.log(data.data)
    }
    else if (command == "PAUSE") {

        cursorSet(cont_bttn, "pointer")

        bttonColor(cont_bttn, "orange")

        var lineNo = data.data
        stepLineShow(lineNo)

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

        program_running = true
    }
    else if (command == "PROGRAM_EXIT")
    {
        cursorSet(cont_bttn, "not-allowed")

        console.log("::: Exited!\n")

        cursorSet(document.body, "default")
        cursorSet(play_bttn, "pointer")
        bttonColor(play_bttn, "lightgreen")

        stepLineHide()

        program_running = false
    }
    else 
    {
        console.log("UNKOWN COMMAND", command)
    }
}

function formatCommand(command, info) {
    return { command, ...info }
}

function compile() {
    const textContent = editor.doc.getValue().split("\n")

    terminal.value = ""

    wasm_worker.postMessage(formatCommand("COMPILE", { textContent }))
}