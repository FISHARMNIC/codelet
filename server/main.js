const http = require('http');
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const fs = require('fs')
const {execSync, exec} = require('child_process')

const site_dir = `${__dirname}/../site`
const serve = serveStatic(site_dir)

const setBreaks = require("./breaks.js")

const compiler_dir = `${__dirname}/compilation`

const server = http.createServer(function (req, res) {
    if (req.method == "GET") {

        var url = req.url.split("/")
        if (url[0] == "")
            url.splice(0, 1)

        if (url[0] == "") req.url = "index.html"

        console.log("GET", req.url)

        if (!(fs.existsSync(site_dir + '/' + req.url))) {
            console.error(`File ${site_dir + '/' + req.url} does not exist!`)
        }
          
        var done = finalhandler(req, res);
        serve(req, res, done)
    }
    else if (req.method == "POST") {
        console.log("post")
        var body = ''
        req.on('data', function (data) {
            body += data
        })
        req.on('end', function () {
            body = JSON.parse(body)

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(handle(body));
        })
    }
})

function handle(parsed)
{
    function fmt(success, data)
    {
        return JSON.stringify({success, data})
    }

    var data = parsed.data

    data = setBreaks(data)

    console.log("================\n", data, "================")

    switch(parsed.command)
    {
        case "compile":
            fs.writeFileSync(`${compiler_dir}/input.c`, data)
            try{
                const out = execSync(`${compiler_dir}/compile.sh`)
                const compiledData = fs.readFileSync(`${compiler_dir}/output.wasm`)
                return(fmt(1, {out, bin: compiledData}))
            }
            catch(err)
            {
                return(fmt(0, err.message))
            }
            break;
        default:
            return(fmt(0, "?"))
    }
}

process.on('SIGINT', function () {
    server.close()
    process.exit(0)
});


server.listen(8080)
//exec(`open -a "Google Chrome" http://localhost:8080`);