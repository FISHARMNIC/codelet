/*

Todo: only recompile if you modify the textarea

*/

var display_memory = document.getElementById("memory")
var cont_bttn = document.getElementById("dbg_continue")
var dbgline = document.getElementById("linebar")

const wasm_worker = new Worker("js/worker/worker.js", { type: "module" })

wasm_worker.onerror = (e) => {
    console.error("WORKER ERR", e)
}

wasm_worker.onmessage = (message) => {
    var data = message.data
    var command = data.command
    if(command == "PRINT")
    {
        console.log(data.data)
    }
    else if(command == "PAUSE")
    {
        cont_bttn.style.color="orange"
        var lineNo = data.data
        //console.log(editor.charCoords({line: lineNo}))
        dbgline.style.top = editor.charCoords({line: lineNo}).top + "px"
        dbgline.style.display = "flex"
        document.body.style.cursor = "default"
    }
    else if(command == "COMPILE_START")
    {
        console.log("Compiling...\n")
        document.body.style.cursor = "wait"
    }
    else if(command == "COMPILE_DONE")
    {
        console.log("Running...\n")
        document.body.style.cursor = "default"
}
}

function formatCommand(command, info)
{
    return {command, ...info}
}

function compile() {
    const textContent = editor.doc.getValue().split("\n")

    wasm_worker.postMessage(formatCommand("COMPILE", {textContent}))
}