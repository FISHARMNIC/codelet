//#region comms.js
const site = self.location.origin

function send(string, next) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", site, false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status != 200) {
                terminal.value += "Post failed\n"
            }
            else {

                var out = JSON.parse(xhr.responseText);
                if (out.success) {
                    next(out.data)
                }
                else {
                    console.log("=== Compilation error ===\n" + out.data)

                }
            }
        }
    };

    xhr.send(string);
}

function formatPost(command, data) {
    return JSON.stringify({ command, data })
}
//#endregion

//#region msg.js
function sendCommand(command, info)
{
    postMessage({command, ...info})
}

const saved_console_log = console.log

console.log = (...args) => sendCommand("PRINT", {data: args})
//#endregion

//#region wasm.js
var wasm_bin
var wasm = {}
var memory_snapshot = []
var section_info = {}
var care_region = {}

var env = {
    memory: new WebAssembly.Memory({
        initial: 1,
        maximum: 1,
    }),

    console_string: (char_p) => {
        //console.log(char_p)
        console.log(read_wasm_string(char_p));
    }, 
    __wasm_break__: async function (lineNo) {


        //console.log("== Breakpoint Called! ==\n");

        var new_memory = Array.from(new Uint8Array(wasm.memory.buffer))

        if (memory_snapshot.length != 0) {
            compare_memory(memory_snapshot, new_memory)
        }

        memory_snapshot = new_memory

        console.log(`\nPaused after line ${lineNo}\n`)

        postMessage({command: "PAUSE", data: lineNo})
        
        await dbg_wait()
    },
    __give_section_info__: function(data, bss, rodata)
    {
        section_info = {data, bss, rodata}
        care_region.min = Math.min(data, bss, rodata)
        care_region.max = Math.max(data, bss, rodata) + 1000
        care_region.size = care_region.max - care_region.min
        //console.log(section_info)
    },
    __program_finished__: function()
    {
        sendCommand("PROGRAM_EXIT")
    },
    console_double: console.log,
    console_int: console.log,
    console_char: (c) => console.log(String.fromCharCode(c)),
}

function read_wasm_string(base) {
    const memsz = wasm.memory.buffer.byteLength

    const strBuf = new Uint8Array(wasm.memory.buffer, base);

    var i = 0;
    while (strBuf[i] != 0 && i < memsz)
        i++

    return new TextDecoder().decode(strBuf).slice(0, i);
}

function compare_memory(old_mem, new_mem) {
    //console.log("comparing", old_mem.size)
    for (var i = care_region.min; i < care_region.max; i++) {
        if (old_mem[i] != new_mem[i]) {
            console.log(`CHANGE @Memory[${i}] : ${old_mem[i]} ==> ${new_mem[i]}\n`)
        }
    }
    //console.log("done")
}
//#endregion

//#region dbg.js
function waitEv(event) {
    return new Promise((resolve) => {
        self.onmessage = (event) => {
            if(event.data == "CONT")
            {
                self.onmessage = normal_handler
                resolve(event.data)
            }
        };
    });
}

async function dbg_wait() {
    //console.log("Waiting")

    await waitEv("ev_dbg_cont")

    //console.log("done")
}
//#endregion

import * as Asyncify from 'https://unpkg.com/asyncify-wasm?module';

async function run(data)
{
    var textContent = data.textContent
        sendCommand("COMPILE_START")
        send(formatPost("compile", textContent), (out) => {
            //terminal.value += out.out
            wasm_bin = new Uint8Array(out.bin.data).buffer


            WebAssembly.compile(wasm_bin)
                .then(module => Asyncify.instantiate(module, { env }))
                .then(instance => instance.exports)
                .then(async exports => {
                    sendCommand("COMPILE_DONE")
                    wasm.instance = exports
                    wasm.memory = exports.memory
                    
                    //saved_console_log(wasm.memory)
                    await wasm.instance.start()
    
                })
        })
}

self.onmessage = (event) => {
    const data = event.data
    const command = data.command

    //console.log("------ GOT ------")
    if(command == "COMPILE")
    {
        run(data)
    }else 
    {
        console.log(`Unknown command ${command}`)
    }
}

var normal_handler = self.onmessage