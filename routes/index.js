var express = require('express');
var router = express.Router();

var cassandra = require('../utils/cassandra');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({message: 'Hello World!'});
});

module.exports = router;
