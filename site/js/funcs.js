function cursorSet(s)
{
    document.body.style.cursor = s
}

function contBttonColor(c)
{
    cont_bttn.style.color=c
}

function stepLineShow(lineNo)
{
    dbgline.style.top = editor.charCoords({line: lineNo}).top + "px"
    dbgline.style.display = "flex"
}

function stepLineHide()
{
    dbgline.style.display = "none"
}

