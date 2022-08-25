module.exports = {
    fields: {
        name: {
            type: 'varchar',
        },
        data: {
            type: 'ascii',
        },
        id: {
            type: 'uuid'
        },
        workflow: 'uuid',
        depends_on: {
            type: 'frozen',
            typeDef: '<list<uuid>>'
        }
    },
    key: ['id'],
    options: {
        timestamps: true,
    }
}
