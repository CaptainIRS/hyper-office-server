const { client } = require('../elastic/connect');
const router = require('express').Router();

router.get('/query', async (req, res) => {
    const { query, formId } = req.body;
    await client.indices.refresh({index: formId});
    const result = await client.search({
        index: formId,
        query
    })
    console.log(result.hits.hits.map(hit => hit._source));
    res.json(result.hits.hits.map(hit => hit._source));
})
