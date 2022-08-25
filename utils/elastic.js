const { client } = require('../elastic/connect');

module.exports.index = async (formId, docuemntId, data) => {
    await client.index({
        index: formId,
        id: docuemntId,
        document: data
    });
}

module.exports.update = async (formId, documentId, data) => {
    await client.update({
        index: formId,
        id: documentId,
        document: data
    });
}

module.exports.delete = async (formId, documentId) => {
    await client.delete({
        index: formId,
        id: documentId
    });
}

module.exports.testIndex = async () => {
    await client.index({
        index: 'test',
        document: {
            character: 'Ned Stark',
            quote: 'Winter is coming.'   
        }
    });
    await client.indices.refresh({index: 'test'});
    const result = await client.search({
        index: 'test',
        query: {
            match: { quote: 'winter' }
        }
    })
    console.log(result.hits.hits);
}
