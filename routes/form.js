var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');
var fs = require('fs');

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
        let saved_response;
        try {
            saved_response = await models.instance.FormResponse.findOneAsync({form: models.uuidFromString(req.query.id), email: req.user.email});
        } catch (err) {
            console.log("No saved response");
        }
        if (form) {
            if (saved_response) {
                res.send({form: form.toJSON(), saved_response: saved_response.toJSON()})
            } else {
                res.send({form: form.toJSON()})
            }
        } else {
            res.send({message: `Failed to get ${req.query.id}`});
        }
    } catch (err) {
        res.status(500).send({message: `Failed to get ${req.query.id}`});
    }
});

router.post('/save_response', async function(req, res) {
    try {
        const {formId, response} = req.body;
        const saved_response = new models.instance.FormResponse({
            email: req.user.email,
            form: models.uuidFromString(formId),
            data: response
        });
        await saved_response.saveAsync();
        res.status(200).json({message: 'Form Saved'});
    } catch (err) {
        res.status(500).send({message: 'Failed to save form response'});
    }
});

router.post('/save_pdf', async function(req, res) {
    const file_buffer = Buffer.from(req.body.base64, 'base64');
    const file = fs.writeFileSync(req.body.fileName, file_buffer, {encoding: 'base64'});
    res.status(200).send({message: 'Saved PDF'});
})

module.exports = router;