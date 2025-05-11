const site = window.location.origin
const terminal = document.getElementById("terminal")

function get(command) {
    const xhr = new XMLHttpRequest()
    try {
        xhr.open('GET', site + "/get/" + command, false)
        xhr.send(null)
    } catch (error) {
        terminal.value += "Unable to access server\n"
    }
    if (xhr.status != 200) {
        terminal.value += "Server failed to process request\n"
        return 0
    }
    return xhr.responseText
}