var saved_console_log = console.log

console.log = function() {
    saved_console_log(...arguments)
    Array.from(arguments).forEach(arg => {
        terminal.value += arg
    })
}