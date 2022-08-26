const { response } = require('express');
const { client } = require('../elastic/connect');
const router = require('express').Router();
const models = require('../utils/cassandra');

const getReverseID = (id) => {
    if(id.startsWith('id_')) {
        id = id.substring(3);
    }
    return id.split('_').join('-');
}

const dereferenceID = (id, options) => {
    id = getReverseID(id)
    return options.find(option=> option.id === id).value
}

router.post('/query', async (req, res) => {
    try {

        const { query, formId } = req.body;
        parsedQuery = JSON.parse(query).replace(/-/g, '_');
        console.log(parsedQuery);
        await client.indices.refresh({index: `id_${formId.replace(/-/g, '_')}`});
        console.log(`SELECT * FROM id_${formId.replace(/-/g, '_')} WHERE (${parsedQuery})`);
        const result = await client.sql.query({
            query: `SELECT * FROM id_${formId.replace(/-/g, '_')} WHERE (${parsedQuery})`,
        });
        var form, fieldsData;
        try {
            form = await models.instance.Form.findOneAsync({
                id: models.uuidFromString(formId)
            });
            fieldsData = JSON.parse(form.data);
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Error Finding Form'});
        }
        var columnNames = [];
        var elements = [];
        result.columns.forEach( async (column) => {
            const id = getReverseID(column.name);
            const field = fieldsData.find(field => field.id === id);
            if(field) {
                columnNames.push(field.label.blocks[0].text);
                elements.push({
                    element: field.element,
                    options: field.options
                })
            }
        });
        dereferencedRows = [];
        result.rows.forEach( (row) => {
            console.log(row)
            var newRow = [];
            row.forEach( (value, index) => {
                if(value && 
                    (elements[index].element=== 'Checkboxes' || 
                    elements[index].element==='Dropdown' ||
                    elements[index].element=== 'RadioButtons' 
                    )
                ) {
                    console.log("considering", value)
                    newRow.push(dereferenceID(value, elements[index].options))
                }
                else newRow.push(value);
            })
            dereferencedRows.push(newRow)
        });
        res.json({
            columns: columnNames,
            values: dereferencedRows
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: 'Error Querying Elastic'});
    }
})

module.exports = router;