var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');

router.post('/create_form', async function(req, res) {
    const {name, data} = req.body;
    try {
        const form = new models.instance.Form({
            name: name,
            data: data
        });
        await form.saveAsync();
        res.status(200).json({message: 'Form Created'});
    } catch (err) {
        res.status(500).send({message: 'Error creating form'});
    }
});

router.get('/form_list', async function(req, res) {
    try {
        const forms = await models.instance.Form.findAsync({}, {select: ['name']});
        res.json(forms);
    } catch (err) {
        console.log(err);
        res.status(500).send({message: 'Failed to fetch form list'});
    }
});

router.get('/get_form', async function(req, res) {
    try {
        const form = await models.instance.Form.findOneAsync({name: req.query.name});
        if (form) {
            res.send(form.toJSON())
        } else {
            res.send({message: `Failed to get ${req.query.name}`});
        }
    } catch (err) {
        res.status(500).send({message: `Failed to get ${req.query.name}`});
    }
});

module.exports = router;