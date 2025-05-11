var display_memory = document.getElementById("memory")
var cont_bttn = document.getElementById("dbg_continue")
var dbgline = document.getElementById("linebar")
const site = window.location.origin
const terminal = document.getElementById("terminal")

var saved_console_log = console.log

console.log = function() {
    saved_console_log(...arguments)
    Array.from(arguments).forEach(arg => {
        terminal.value += arg
    })
}