const { client } = require('../elastic/connect');

module.exports.index = async (formId, docuemntId, data) => 
    await client.index({
        index: formId,
        id: docuemntId,
        document: data
    });


module.exports.update = async (formId, documentId, data) => 
    await client.update({
        index: formId,
        id: documentId,
        document: data
    });


module.exports.delete = async (formId, documentId) => 
    await client.delete({
        index: formId,
        id: documentId
    });


// testIndex = async () => {
//     // await client.delete({
//     //     index: 'test'
//     // });
//     const cleardb = await client.deleteByQuery({
//         index: 'test',
//         query: { match_all: {} }
//     });
//     await client.index({
//         index: 'test',
//         document: {
//             name: 'John Doe',
//         }
//     });
//     await client.index({
//         index: 'test',
//         document: {
//             name: 'John',
//         }
//     });
//     const result = await client.sql.query({
//         query: 'SELECT * FROM test WHERE name like \'%John%\''
//     })
//     console.log(result);
// }

// testIndex();
