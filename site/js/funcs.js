var display_memory = document.getElementById("memory")
var dbgline = document.getElementById("linebar")
const site = window.location.origin
const terminal = document.getElementById("terminal")

var cont_bttn = document.getElementById("dbg_continue")
var pause_bttn = document.getElementById("dbg_pause")
var play_bttn = document.getElementById("dbg_play")

var vb1 = document.getElementById("mem_text_dump")
var vb2 = document.getElementById("mem_text_map")

var filePicker = document.getElementById("filePicker")

cont_bttn.style.cursor = "not-allowed"
pause_bttn.style.cursor = "not-allowed"
play_bttn.style.cursor = "pointer"

function cursorSet(d, s) {
    d.style.cursor = s
}

function bttonColor(b, c) {
    b.style.color = c
}

function disableBttn(b, c = "lightgray")
{
    bttonColor(b, c)
    cursorSet(b, "not-allowed")
}

function enableBttn(b, c = "lightgreen")
{
    bttonColor(b, c)
    cursorSet(b, "pointer")
}

function stepLineSet(lineNo)
{
    dbgline.style.top = editor.charCoords({ line: lineNo }).top + "px"
}

function stepLineShow(lineNo) {
    stepLineSet(lineNo)
    dbgline.style.display = "flex"
}

function stepLineHide() {
    dbgline.style.display = "none"
}

filePicker.onchange = (e) => {
    // taken from: https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
    var file = e.target.files[0]; 

    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');
 
    reader.onload = readerEvent => {
       var content = readerEvent.target.result;
       editor.setValue(content)
    }
}