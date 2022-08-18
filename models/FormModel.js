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
        workflow: 'uuid'
    },
    key: ['id'],
    options: {
        timestamps: true,
    }
}
