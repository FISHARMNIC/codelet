var display_memory = document.getElementById("memory")
var dbgline = document.getElementById("linebar")
const site = window.location.origin
const terminal = document.getElementById("terminal")

var cont_bttn = document.getElementById("dbg_continue")
var pause_bttn = document.getElementById("dbg_pause")
var play_bttn = document.getElementById("dbg_play")

cont_bttn.style.cursor = "not-allowed"
pause_bttn.style.cursor = "not-allowed"
play_bttn.style.cursor = "pointer"

function cursorSet(d, s) {
    d.style.cursor = s
}

function bttonColor(b, c) {
    b.style.color = c
}

function stepLineShow(lineNo) {
    dbgline.style.top = editor.charCoords({ line: lineNo }).top + "px"
    dbgline.style.display = "flex"
}

function stepLineHide() {
    dbgline.style.display = "none"
}

