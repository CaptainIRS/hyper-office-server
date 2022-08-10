var express = require('express');
var router = express.Router();

var cassandra = require('../utils/cassandra');

/* GET home page. */
router.get('/', function(req, res, next) {
  cassandra.hosts.forEach(function (host) {
    console.log('Host: %s, Rack: %s', host.address, host.rack);
  });
  res.json({message: 'Hello World!'});
});

module.exports = router;
