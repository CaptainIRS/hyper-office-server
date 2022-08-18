var express = require('express');
var router = express.Router();
var models = require('../utils/cassandra');

router.post("/", async (req, res, next) => {
    const {name, state} = req.body;
    try {
        const workflow = new models.instance.Workflow({
            name,
            state,
            id: models.uuid(),
        });
        await workflow.saveAsync();
        res.status(201).json(workflow);
    } catch (err) {
        res.status(500).send({message: "Error creating workflow"});
    }
})

router.get("/all", async (req, res, next) => {
    try {
        const workflows = await models.instance.Workflow.findAsync({}, {select: ['id','name']});
        res.json(workflows);
    } catch (err) {
        res.status(500).send({message: "Failed to fetch workflow list"});
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const workflow = await models.instance.Workflow.findOneAsync({id: models.uuidFromString(req.params.id)});
        if (workflow) {
            res.json(workflow)
        } else {
            res.status(404).send({message: `Could not find form ${req.params.id}`});
        }
    } catch (err) {
        res.status(500).send({message: `Failed to fetch workflow`});
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const { name, state } = req.body;
        const workflow = await models.instance.Workflow.findOneAsync({id: models.uuidFromString(req.params.id)});
        if (workflow) {
            workflow.name = name;
            workflow.state = state;
            await workflow.saveAsync();
            res.status(200).json(workflow);
        } else {
            res.status(404).send({message: `Could not find form ${req.params.id}`});
        }
    } catch (err) {
        res.status(500).send({message: `Error updating workflow ${req.params.id}`});
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const workflow = await models.instance.Workflow.findOneAsync({id: models.uuidFromString(req.params.id)});
        if (workflow) {
            await workflow.deleteAsync();
            res.status(200).json({message: 'Workflow Deleted'});
        } else {
            res.status(404).send({message: `Could not find workflow ${req.params.id}`});
        }
    } catch (err) {
        res.status(500).send({message: `Error deleting workflow ${req.params.id}`});
    }
})

module.exports = router;
