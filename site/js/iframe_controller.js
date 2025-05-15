window.onmessage = (message) => {
    var data = message.data
    var command = data.command

    if(command == "SET_EDITOR")
    {
        editor.setValue(data.text)
    }

    // document.write(JSON.stringify(command))
}