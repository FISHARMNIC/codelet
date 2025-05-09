/*

Todo: only recompile if you modify the textarea

*/


var wasm_bin

var wasm = {
    memory: new WebAssembly.Memory({
        initial: 1,
        maximum: 100,
    })
}


function compile() {
    const textContent = editor.doc.getValue().split("\n")
    send(formatPost("compile", textContent), (out) => {
        //terminal.value += out.out
        wasm_bin = new Uint8Array(out.bin.data).buffer

        WebAssembly.compile(wasm_bin)
            .then(module => WebAssembly.instantiate(module, { env, mem:wasm.memory }))
            .then(instance => instance.exports)
            .then(exports => {
                wasm.instance = exports
                //wasm.memory = exports.memory
                
                wasm.instance.main()

            })
    })
}