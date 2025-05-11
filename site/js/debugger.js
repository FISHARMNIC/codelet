const ev_dbg_cont = new Event("ev_dbg_cont")

var ready;

function getPromiseFromEvent(event) {
    return new Promise((resolve) => {
        const listener = () => {
            window.removeEventListener(event, listener);
            resolve();
        }
        window.addEventListener(event, listener);
    });
}

async function dbg_wait() {
    console.log("Waiting\n")

    await getPromiseFromEvent("ev_dbg_cont")

    console.log("done\n")
}

function dbg_continue() {
    document.body.style.cursor = "wait"
    cont_bttn.style.color="white"
    dbgline.style.display = "none"
    wasm_worker.postMessage("CONT")
}