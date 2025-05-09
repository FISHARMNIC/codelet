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
          else
          {
            
            var out = JSON.parse(xhr.responseText);
            if(out.success)
            {
                next(out.data)
            } 
            else
            {
                terminal.value += "=== Compilation error ===\n" + out.data

            }
          }
        }
      };

    xhr.send(string);
}

function formatPost(command, data)
{
    return JSON.stringify({command, data})
}