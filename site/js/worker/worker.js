// #region globals
var wasm_bin
var wasm = {}
var memory_snapshot = []
var section_info = {}
var care_region = {}

var memory_views = []
var mem_padlen = 0
var memory_mode = 0

var manualBreaks = false

var asmodes = {
    AS_BYTES: 1,
    AS_SHORTS: 2,
    AS_WORDS: 3,
    AS_CHARS: 4
}
// #endregion

//#region comms.js
const site = self.location.origin

function send(string, next) {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", site, false)
    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status
            if (status != 200) {
                sendCommand("POSTFAIL")
            }
            else {

                var out = JSON.parse(xhr.responseText)
                if (out.success) {
                    next(out.data)
                }
                else {
                    console.log("=== Compilation error ===\n" + out.data)
                    sendCommand("COMPFAIL")
                }
            }
        }
    }

    xhr.send(string)
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

//#region env
var env = {
    memory: new WebAssembly.Memory({
        initial: 1,
        maximum: 1,
    }),

    console_string: (char_p) => {
        //console.log(char_p)
        console.log(read_wasm_string(char_p))
    },
    __wasm_break__: async function (lineNo) {

        var wasneg = lineNo < 0
        lineNo = Math.abs(lineNo)
        //console.log("== Breakpoint Called! ==\n")

        var new_memory = Array.from(new Uint8Array(wasm.memory.buffer, care_region.min, care_region.size))
        var res = compare_memory(memory_snapshot, new_memory)
        sendCommand("MEMORY", { mem: res })
        memory_snapshot = new_memory

        console.log(`\nPaused after line ${lineNo}\n`)

        if (!manualBreaks || wasneg) {
            postMessage({ command: "PAUSE", data: lineNo })

            await dbg_wait()
        }
    },
    __give_section_info__: function (stack, data, bss, rodata) {
        section_info = { stack, data, bss, rodata }
        care_region.min = Math.min(stack, data, bss, rodata) - 1000
        care_region.max = Math.max(stack, data, bss, rodata) + 1000
        care_region.size = care_region.max - care_region.min
        //console.log(care_region)

        if (care_region.size > 10000) {
            window.alert("Warning: large range of memory is begin tracked. May result in slower speeds")
        }
    },
    __program_finished__: function () {
        sendCommand("PROGRAM_EXIT")
    },
    js_break: async function (lineNo) {
        await env.__wasm_break__(-lineNo)
    },
    js_memview(mode) {
        memory_mode = mode
        sendCommand("MEMVIEW", { mode })
    },
    __js_addview__: function (name, address, size, mode) {
        if (mode == asmodes.AS_SHORTS) {
            size *= 2
        }
        else if (mode == asmodes.AS_WORDS) {
            size *= 4
        }

        name = read_wasm_string(name)
        memory_views.push({ name: name, address, size, mode })
        if (name.length > mem_padlen) {
            mem_padlen = name.length
        }
        //console.log("views", memory_views)
        // saved_console_log("===>", wasm.instance.emscripten_stack_get_current())
        // saved_console_log("===>", wasm.instance.emscripten_stack_get_base())
        // saved_console_log("===>", wasm.instance.emscripten_stack_get_end())
    },
    __js_removeview__: function(name, address)
    {
        name = read_wasm_string(name)
        memory_views = memory_views.filter(view => {
            return !((view.name == name) && (view.address == address))
        })
    },
    __js_removeview_weak__: function(name)
    {
        name = read_wasm_string(name)
        memory_views = memory_views.filter(view => {
            return(view.name != name)
        })
    },
    js_removeview_all: function()
    {
        memory_views = []
    },
    console_double: console.log,
    console_int: console.log,
    console_char: (c) => console.log(String.fromCharCode(c)),
}
// #endregion

// #region wasm utils
function read_wasm_string(base) {
    const memsz = wasm.memory.buffer.byteLength

    const strBuf = new Uint8Array(wasm.memory.buffer, base)

    var i = 0
    while (strBuf[i] != 0 && i < memsz)
        i++

    return new TextDecoder().decode(strBuf).slice(0, i)
}

function u8_to_u16(arr, i) {
    return arr[i] | (arr[i + 1] << 8)
}

function u8_to_u32(arr, i) {
    return arr[i] | (arr[i + 1] << 8) | (arr[i + 2] << 16) | (arr[i + 3] << 24)
}

function compare_memory(old_mem, new_mem) {
    //console.log("comparing", old_mem.length)

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
        if (memory_views.length == 0) {
            out = 'Use "js_addview" to add views!'
        }
        else {
            memory_views.forEach(view => {
                var start_addr = view.address - care_region.min
                var end_addr = view.size + start_addr
                //saved_console_log(new_mem.slice(start_addr, end_addr))

                var sliced = new_mem.slice(start_addr, end_addr)
                var sbuffer = sliced.map((x, i) => {
                    var trueAddr = start_addr + i

                    var padded

                    var old_at = old_mem[trueAddr]
                    var new_at = new_mem[trueAddr]

                    switch (view.mode) {
                        case asmodes.AS_CHARS:
                            padded = String.fromCharCode(x)
                            break

                        case asmodes.AS_BYTES:
                            padded = x.toString().padStart(3, "0")
                            break

                        case asmodes.AS_SHORTS:
                            if (i % 2 == 0) {
                                var num = u8_to_u16(sliced, i)
                                old_at = u8_to_u16(old_mem, trueAddr)

                                new_at = num

                                var negative = (num < 0) ? "-" : ""
                                num = Math.abs(num)

                                padded = negative + num.toString().padStart(5, "0")
                            }
                            else {
                                return ""
                            }
                            break

                        case asmodes.AS_WORDS:
                            if (i % 4 == 0) {
                                var num = u8_to_u32(sliced, i)
                                old_at = u8_to_u32(old_mem, trueAddr)

                                new_at = num

                                var negative = (num < 0) ? "-" : ""
                                num = Math.abs(num)

                                // yes this is horrible code. fix later
                                padded = negative + num.toString().padStart(10 - negative.length, "0")
                            }
                            else {
                                return ""
                            }
                            break
                    }

                    padded = `<span class='paddedBoxes' ">${padded}</span>`

                    if (old_at != new_at) {
                        console.log(`\nCHANGE @Memory[${trueAddr + care_region.min}] : ${old_at} ==> ${new_at}\n`)
                        padded = `<span id="scrollInto" style="background-color:orange;">${padded}</span>`
                    }

                    return padded
                }).join("")

                out += `${view.name.padEnd(mem_padlen, "\xa0")} @${view.address} :<span style="border: 1px solid black; border-right:none;">${sbuffer}</span><br><br>`
            })
        }
    }

    return out
    //sendCommand("MEMORY", {mem: new_mem})
    //console.log("done")
}

function reset() {
    manualBreaks = false
    memory_mode = 0
    memory_views = []
    memory_snapshot = []
}
//#endregion

//#region debugger utils
function waitEv(event) {
    return new Promise((resolve) => {
        self.onmessage = (event) => {
            if (event.data == "CONT") {
                self.onmessage = normal_handler
                resolve(event.data)
            } else if(event.data == "PAUSEMODE") {
                manualBreaks = !manualBreaks
            }
        }
    })
}

async function dbg_wait() {
    await waitEv("ev_dbg_cont")
}
//#endregion

// #region compiler and instantiator
import * as Asyncify from 'https://unpkg.com/asyncify-wasm?module'

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

                // saved_console_log("===>", await wasm.instance.emscripten_stack_get_base())
                // saved_console_log("===>", await wasm.instance.emscripten_stack_get_current())
                await wasm.instance.start()

            })
    })
}
// #endregion

// #region listener
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
// #endregion