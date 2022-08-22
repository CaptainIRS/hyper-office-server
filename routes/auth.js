var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');
var bcrypt = require('bcrypt');
const passport = require('passport');
const getTabs = require('../utils/getTabs');
const blockchain = require('../utils/blockchain');

router.post('/register', async function(req, res, next) {
    const {email, name, password, role} = req.body;
    if (role === 'User') {
        await blockchain.enrollUser(email);
    } else if (role === 'Moderator') {
        await blockchain.enrollModerator(email);
    } else if (role === 'Administrator') {
        await blockchain.enrollAdministrator(email);
    } else {
        return res.status(400).json({message: 'Invalid role'});
    }
    try {
        const user = await models.instance.User.findOneAsync({email: email});
        if (user) {
            res.status(409).json({message: 'User already exists'});
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const newUser = new models.instance.User({
                email: email,
                name: name,
                password: hash,
                role: role,
            });
            await newUser.saveAsync();
            res.status(201).json({message: 'User created'});
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: 'Error registering user'});
    }
});

router.post('/login', async function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        console.log(user.role);
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({message: 'Incorrect email or password'});
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({message: 'User logged in'});
        });
    })(req, res, next);
});

router.get('/user', async function(req, res) {
    try {
        const tabs = getTabs(req.user.role);
        res.send({...req.user, tabs});
    } catch (err) {
        res.status(500).send({message: 'Error getting user'});
    }
})

router.get('/logout', function(req, res, next) {
    req.logout( function(err) {
        if (err) return next(err);
        res.status(200).json({message: 'User logged out'});
    })
});

module.exports = router;