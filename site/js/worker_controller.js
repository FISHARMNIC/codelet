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
        contBttonColor("orange")

        var lineNo = data.data
        stepLineShow(lineNo)

        cursorSet("default")
    }
    else if (command == "COMPILE_START") {
        console.log("::: Compiling...\n")
        cursorSet("wait")
    }
    else if (command == "COMPILE_DONE") {
        console.log("::: Running...\n")
        cursorSet("default")
        program_running = true
    }
    else if (command == "PROGRAM_EXIT")
    {
        console.log("::: Exited!\n")
        cursorSet("default")
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

    wasm_worker.postMessage(formatCommand("COMPILE", { textContent }))
}