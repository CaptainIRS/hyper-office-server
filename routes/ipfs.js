var express = require('express');
var router = express.Router();
var http = require('http');

router.get('/:id', async function(req, res) {
    // Can add further checks
    // Can also be used in consent route
    if(!req.isAuthenticated()) {
        res.status(401).send('Unauthorized');
    }
    try {
        var externalReq = http.request({
            hostname: `${process.env.IPFS_HOST || 'localhost'}`,
            port: '8080',
            path: `/ipfs/${req.params.id}`,
        }, function(externalRes) {
            if (externalRes.headers['content-type'] === 'application/pdf') {
                res.setHeader('Content-Type', externalRes.headers['content-type']);
                res.setHeader('Content-Length', externalRes.headers['content-length']);
                console.log(externalRes.headers['content-type']);
                externalRes.pipe(res);
            }
            else {
                console.log("Error Fetching file from IPFS");
                var body = '';
                externalRes.on('data', function(chunk) {
                    body += chunk;
                })
                externalRes.on('end', function() {
                    console.log(body);
                })
                res.status(500).send({
                    message: 'Error getting file'
                });
            }
        })
        externalReq.end();
    }
    catch (err) {
        res.status(500).send({message: 'Error getting file'});
    }
});

module.exports = router;