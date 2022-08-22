var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');
router.post('/set', async function(req, res) {
    if(!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    const {email, role} = req.body;
    try {
        const user = await models.instance.User.findOneAsync({email: email});
        if (user) {
            user.role = role;
            await user.saveAsync();
            res.status(200).json({message: 'User role set'});
        }
        else {
            res.status(404).json({message: 'User not found'});
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: 'Error setting user role'});
    }
})

router.get('/list', async function(req, res) {
    const roles = [ 'Administrator', 'Moderator', 'User' ];
    res.status(200).json(roles);  
})

module.exports = router;