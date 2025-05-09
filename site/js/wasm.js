var saved_console_log = console.log

console.log = function() {
    saved_console_log(...arguments)
    Array.from(arguments).forEach(arg => {
        terminal.value += arg
    })
}

function read_wasm_string(base) {
    const memsz = wasm.memory.buffer.byteLength
    
    const strBuf = new Uint8Array(wasm.memory.buffer, base);

    var i = 0;
    while (strBuf[i] != 0 && i < memsz)
        i++

    return new TextDecoder().decode(strBuf).slice(0, i);
}

var env = {
    console_string: (char_p) => {
        console.log(read_wasm_string(char_p));
    },
    __wasm_break__: (char_p) => {
        console.log("== Breakpoint Called! ==\n");
    },
    console_double: console.log,
    console_int: console.log,
    console_char: (c) => console.log(String.fromCharCode(c)),
}