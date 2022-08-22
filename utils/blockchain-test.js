const blockchain = require("./blockchain");

blockchain.addFile({email: "a@a.com", role: "Administrator"}, "hash1").then(console.log);