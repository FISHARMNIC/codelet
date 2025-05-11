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
function sendCommand(command, info) {
    postMessage({ command, ...info })
}

const saved_console_log = console.log

console.log = (...args) => sendCommand("PRINT", { data: args })
//#endregion

//#region wasm.js

var wasm_bin
var wasm = {}
var memory_snapshot = []
var section_info = {}
var care_region = {}

var memory_views = []
var mem_padlen = 0
var memory_mode = 0

var asmodes = {
    AS_BYTES: 1,
    AS_SHORTS: 2,
    AS_WORDS: 3,
    AS_CHARS: 4
};

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

        var new_memory = Array.from(new Uint8Array(wasm.memory.buffer, care_region.min, care_region.size))

        var res = compare_memory(memory_snapshot, new_memory)

        sendCommand("MEMORY", { mem: res })

        memory_snapshot = new_memory


        console.log(`\nPaused after line ${lineNo}\n`)

        postMessage({ command: "PAUSE", data: lineNo })

        await dbg_wait()
    },
    __give_section_info__: function (data, bss, rodata) {
        section_info = { data, bss, rodata }
        care_region.min = Math.min(data, bss, rodata)
        care_region.max = Math.max(data, bss, rodata) + 1000
        care_region.size = care_region.max - care_region.min
        //console.log(section_info)
    },
    __program_finished__: function () {
        sendCommand("PROGRAM_EXIT")
    },
    js_focuson: function (addr, amount) {

    },
    js_memview(mode) {
        memory_mode = mode
        sendCommand("MEMVIEW", {mode})
    },
    __js_addview__: function (name, address, size, mode) {
        name = read_wasm_string(name)
        memory_views.push({ name: name, address, size, mode})
        if(name.length > mem_padlen)
        {
            mem_padlen = name.length
        }
        console.log("views", memory_views)
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

    var out = ""

    if (memory_mode == 0) {

        if (old_mem.length == 0) {
            return new_mem.map(x => x.toString().padStart(3, "0")).join(" ")
        }

        for (var i = 0; i < care_region.size; i++) {
            var trueAddr = i + care_region.min
            if (old_mem[i] != new_mem[i]) {
                console.log(`\nCHANGE @Memory[${trueAddr}] : ${old_mem[i]} ==> ${new_mem[i]}\n`)
                out += `<span id="scrollInto" style="background-color:orange;">${new_mem[i].toString().padStart(3, "0")}</span> `
            } else {
                out += new_mem[i].toString().padStart(3, "0") + " "
            }
        }
    }
    else {
        memory_views.forEach(view => {
            var start_addr = view.address - care_region.min
            var end_addr = view.size + start_addr
            saved_console_log(new_mem.slice(start_addr, end_addr))

            var sbuffer = new_mem.slice(start_addr, end_addr).map((x,i) => {
                var trueAddr = start_addr + i

                var padded;

                if(view.mode == asmodes.AS_CHARS)
                {
                    padded = String.fromCharCode(x)
                }
                else
                {
                    if(view.mode != asmodes.AS_BYTES)
                    {
                        console.log(`NOTE: only AS_CHARS and AS_BYTES currently supported. Treating as AS_BYTES`)
                    }
                    padded = x.toString().padStart(3, "0")
                }

                padded = `<span class='paddedBoxes' ">${padded}</span>`

                if(old_mem[trueAddr] != new_mem[trueAddr])
                {
                    console.log(`\nCHANGE @Memory[${trueAddr + care_region.min}] : ${old_mem[trueAddr]} ==> ${old_mem[trueAddr]}\n`)
                    padded = `<span id="scrollInto" style="background-color:orange;">${padded}</span>`
                }

                return padded
            }).join("")

            out += `${view.name.padEnd(mem_padlen + 2, "\xa0")}: <span style="border: 1px solid black; border-right:none;">${sbuffer}</span><br><br>`
        })
    }

    return out
    //sendCommand("MEMORY", {mem: new_mem})
    //console.log("done")
}
//#endregion

//#region dbg.js
function waitEv(event) {
    return new Promise((resolve) => {
        self.onmessage = (event) => {
            if (event.data == "CONT") {
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

async function run(data) {
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

function reset()
{
    memory_views = []
}

self.onmessage = (event) => {
    const data = event.data
    const command = data.command

    //console.log("------ GOT ------")
    if (command == "COMPILE") {
        reset()
        run(data)
    } else {
        console.log(`Unknown command ${command}`)
    }
}

var normal_handler = self.onmessage