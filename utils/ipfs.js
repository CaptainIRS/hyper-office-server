var create = require("ipfs-http-client")

var ipfs = create({
    host: "localhost",
    port: "5001",
    protocol: "http"
})

// var file = fs.readFileSync("./test.txt")

module.exports = ipfs