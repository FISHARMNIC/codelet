/*

Isnt finished, doesnt work for macros (especially multiline)

This basically inserts a breakpoint at every line inside of a function

*/


function setBreaks(code) {

    // yes, inefficient, I know. Fix later
    if(Array.isArray(code))
    {
        code = code.join("\n")
    }
    var split = []
    var build = []

    var inQuotes = false
    var quoteType = "none"

    var inComment = false
    var commentType = "none"

    var waitingOpen = false
    var waitingClose = false

    var lineNumber = 1

    var depth = 0

    code = code.split("")
    code.forEach((letter, i) => {
        var next = code[i + 1]
        var next2 = code[i + 2]
        var next3 = code[i + 3]

        build.push(letter)

        if(letter == "\n")
        {
            lineNumber++
        }

        if (inComment) {
            if ((commentType == "single" && letter == "\n") || (commentType == "multi" && letter == "*" && next == "/")) {
                inComment = false
                commentType = "none"
            }
        }
        else if (inQuotes) {
            if (quoteType == letter) {
                inQuotes = false
                quoteType = "none"
            }
        }
        else {
            if (letter == "{") {
                depth++
            }

            if (letter == "/") // entering comment
            {
                if (next == "/") {
                    inComment = true
                    commentType = "single"
                }
                else if (next == "*") {
                    inComment = true
                    commentType = "multi"
                }
            }
            else if (letter == "'" || letter == '"') // entering quotes
            {
                inQuotes = true
                quoteType = letter
            }
            else if ((letter + next + next2) == "for") {
                console.log("OPENER")
                waitingOpen = true
            }
            else if (letter == "(" && waitingOpen) {
                waitingOpen = false
                waitingClose = true
            }
            else if (letter == ")" && waitingClose) {
                waitingClose = false
            }
            else if (letter == "}") {
                depth--
            }
            else if ((letter == ";" || letter == "{") && depth > 0 && !waitingClose) {
                split.push(build, `\n__wasm_break__(${lineNumber});\n`)
                build = []
            }
        }
    })
    split.push(build)

    return split.flat().join("")
}

module.exports = setBreaks