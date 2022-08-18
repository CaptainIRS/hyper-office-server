var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');

router.post('/create_form', async function(req, res) {
    const {name, data, workflow} = req.body;
    try {
        const form = new models.instance.Form({
            name: name,
            data: data,
            workflow: models.uuidFromString(workflow),
            id: models.uuid(),
        });
        await form.saveAsync();
        res.status(200).json({message: 'Form Created'});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Error creating form'});
    }
});


router.post('/update_form', async function(req, res) {
    const {name, data, id, workflow} = req.body;
    try {
        const form = await models.instance.Form.findOneAsync({id: models.uuidFromString(id)});
        form.name = name;
        form.data = data;
        form.workflow = models.uuidFromString(workflow);
        await form.saveAsync();
        res.status(200).json({message: 'Form Updated'});
    } catch (err) {
        res.status(500).send({message: `Error updating form ${id}`});
    }
});

router.delete('/delete_form', async function(req, res) {
    const {id} = req.query;
    try {
        const form = await models.instance.Form.findOneAsync({id: models.uuidFromString(id)});
        await form.deleteAsync();
        res.status(200).json({message: 'Form Deleted'});
    } catch (err) {
        res.status(500).send({message: `Error deleting form: ${id}`});
    }
});

router.get('/form_list', async function(req, res) {
    try {
        const forms = await models.instance.Form.findAsync({}, {select: ['name','id']});
        res.json(forms);
    } catch (err) {
        res.status(500).send({message: 'Failed to fetch form list'});
    }
});

router.get('/get_form', async function(req, res) {
    try {
        const form = await models.instance.Form.findOneAsync({id: models.uuidFromString(req.query.id)});
        if (form) {
            res.send(form.toJSON())
        } else {
            res.send({message: `Failed to get ${req.query.id}`});
        }
    } catch (err) {
        res.status(500).send({message: `Failed to get ${req.query.id}`});
    }
});

module.exports = router;