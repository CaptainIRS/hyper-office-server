const { client } = require('../elastic/connect');
const router = require('express').Router();

router.post('/query', async (req, res) => {
    const { query, formId } = req.body;
    await client.indices.refresh({index: formId});
    const result = await client.search({
        index: formId,
        query: JSON.parse(query)
    });
    res.json(result.hits.hits.map(hit => hit._source));
})

module.exports = router;