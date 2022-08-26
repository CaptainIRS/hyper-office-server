const { client } = require('../elastic/connect');
const router = require('express').Router();

router.post('/query', async (req, res) => {
    const { query, formId } = req.body;
    parsedQuery = JSON.parse(query).replace(/-/g, '_');
    console.log(parsedQuery);
    await client.indices.refresh({index: `id_${formId.replace(/-/g, '_')}`});
    console.log(`SELECT * FROM id_${formId.replace(/-/g, '_')} WHERE (${parsedQuery})`);
    const result = await client.sql.query({
        query: `SELECT * FROM id_${formId.replace(/-/g, '_')} WHERE (${parsedQuery})`,
    });
    console.log(result);
    res.json(result);
})

module.exports = router;