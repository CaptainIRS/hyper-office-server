var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');
var ipfs = require('../utils/ipfs');
var cid = require('cids');
var stream = require('stream')
var all = require('it-all');
var uint8ArrayConcat = require('uint8arrays/concat').concat;

router.post('/create_form', async function(req, res) {
    const {name, data, workflow, dependsOnForms} = req.body;
    try {
        const form = new models.instance.Form({
            name: name,
            data: data,
            workflow: models.uuidFromString(workflow),
            depends_on: dependsOnForms,
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
    const {name, data, id, workflow, dependsOnForms} = req.body;
    try {
        const form = await models.instance.Form.findOneAsync({id: models.uuidFromString(id)});
        form.name = name;
        form.data = data;
        form.workflow = models.uuidFromString(workflow);
        form.depends_on = dependsOnForms;
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
        let savedResponse;
        try {
            savedResponse = await models.instance.FormResponse.findOneAsync({form: models.uuidFromString(req.query.id), email: req.user.email});
        } catch (err) {
            console.log("No saved response");
        }
        if (form) {
            if (savedResponse) {
                res.send({form: form.toJSON(), saved_response: savedResponse.toJSON()})
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

router.post('/save_pdf', async function(req, res) {
    try {
        const {formId, response} = req.body;
        const file_buffer = Buffer.from(req.body.base64, 'base64');
        const ipfsFile = await ipfs.add(file_buffer);
        cid = ipfsFile.cid.toString();
        const savedResponse = new models.instance.FormResponse({
            email: req.user.email,
            form: models.uuidFromString(formId),
            data: response,
            cid: cid,
            stage: 0,
            isDone: false,
            id: models.uuid(),
            name: req.body.name,
        });
        await savedResponse.saveAsync();
        // res.status(200).send({message: 'Successfully saved form and PDF', cid: cid});
        res.redirect(process.env.FRONTEND + '/viewdocs/' + savedResponse.id);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: 'Failed to save form response'});
    }
})

router.get('/response/file/:id/view', async (req, res) => {
    const formResponse = await models.instance.FormResponse.findOneAsync({id: models.uuidFromString(req.params.id)});
    if (!formResponse) {
        res.status(404).json({message: 'Form response not found'});
    }
    const fileBuffer = uint8ArrayConcat(await all(ipfs.cat(formResponse.cid)));
    const readStream = new stream.PassThrough();

    readStream.end(fileBuffer);
    res.set('Content-Disposition', 'inline');
    res.set('Content-Type', 'application/pdf');
    readStream.pipe(res);
})

router.patch('/response/:id/approve', async (req, res) => {
    if(!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    const user = await models.instance.User.findOneAsync({email: req.user.email});
    if (!user) {
        return res.status(400).json({message: 'User does not exist'});
    }
    const formResponse = await models.instance.FormResponse.findOneAsync({id: models.uuidFromString(req.params.id)});
    if (!formResponse) {
        return res.status(404).json({message: 'Form response not found'});
    }
    const form = await models.instance.Form.findOneAsync({ id: formResponse.form });
    if (!form) {
        return res.status(500).json({message: 'Form does not exist'});
    }
    const workflow = await models.instance.Workflow.findOneAsync({ id: form.workflow });
    if (!workflow) {
        return res.status(500).json({message: 'Workflow does not exist'});
    }
    const currentStage = workflow.state[formResponse.stage];
    if (user.role == currentStage.designation) {
        formResponse.stage++;
        if (formResponse.stage == workflow.state.length) {
            formResponse.isDone = true;
            formResponse.nextDesignation = null;
        }
        else {
            formResponse.nextDesignation = workflow.state[formResponse.stage].designation;
        }
        await formResponse.saveAsync();
        res.json({message: 'Approved'});
    }
    else {
        res.status(401).json({message: 'You are not authorized to do this'});
    }
})

router.patch('/response/:id/reject', async (req, res) => {
    if(!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    const user = await models.instance.User.findOneAsync({email: req.user.email});
    if (!user) {
        return res.status(400).json({message: 'User does not exist'});
    }
    const formResponse = await models.instance.FormResponse.findOneAsync({id: models.uuidFromString(req.params.id)});
    if (!formResponse) {
        return res.status(404).json({message: 'Form response not found'});
    }
    const form = await models.instance.Form.findOneAsync({ id: formResponse.form });
    if (!form) {
        return res.status(500).json({message: 'Form does not exist'});
    }
    const workflow = await models.instance.Workflow.findOneAsync({ id: form.workflow });
    if (!workflow) {
        return res.status(500).json({message: 'Workflow does not exist'});
    }
    const currentStage = workflow.state[formResponse.stage];
    if (user.role == currentStage.designation) {
        formResponse.stage = -1;
        formResponse.nextDesignation = null;
        await formResponse.saveAsync();
        res.json({message: 'Rejected'});
    }
    else {
        res.status(401).json({message: 'You are not authorized to do this'});
    }
})

router.get('/response/approved', async (req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    if (user.role != 'User') {
        return res.status(403).json({message: 'You are not a user'});
    }
    const formResponseList = await models.instance.FormResponse.findAsync({}).filter(
        formResponse => formResponse.email == user.email && formResponse.isDone == true
        );
    res.json(formResponseList);
})

router.get('/response/rejected', async (req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    if (user.role != 'User') {
        return res.status(403).json({message: 'You are not a user'});
    }
    const formResponseList = await models.instance.FormResponse.findAsync({}).filter(
        formResponse => formResponse.email == user.email && formResponse.stage == '-1'
        );
    res.json(formResponseList);
})

router.get('/response/processing', async (req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    if (user.role != 'User') {
        return res.status(403).json({message: 'You are not a user'});
    }
    const formResponseList = await models.instance.FormResponse.findAsync({}).filter(
        formResponse => formResponse.email == user.email && parseInt(formResponse.stage) >= 0
        );
    res.json(formResponseList);
})

router.get('/response/toapprove', async (req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    if (user.role == 'User') {
        return res.status(403).json({message: 'You are not a moderator'});
    }
    const formResponseList = await models.instance.FormResponse.findAsync({}).filter(
        formResponse => formResponse.email == user.email && formResponse.nextDesignation == user.designation
        );
    // change name of formResponseList
    formResponseList.forEach(formResponse => {
        formResponse.name = formResponse.name + ' doc from ' + formResponse.email;
    });
    res.json(formResponseList);
})

router.get('/approval_status/:id', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
	let approval_status = '';
	try {
	    const formResponse = await models.instance.FormResponse.findOneAsync({form: models.uuidFromString(req.params.id), email: req.user.email});
            if (formResponse.isDone) {
                approval_status = 'Approved';
	    } else if (formResponse.stage === -1) {
                approval_status = 'Rejected';
	    } else {
		approval_status = 'Processing';
	    }
	} catch (err) {
	    approval_status = 'Not Filled';
	}
	const formName = await models.instance.Form.findOneAsync({id: models.uuidFromString(req.params.id)}, {select: ['name']});
        return res.status(200).json({name: formName.name, approval_status});
    } catch(err) {
        res.status(500).send({message: `Failed to get approval status for form ${req.params.id}`});   
    }
})

module.exports = router;
