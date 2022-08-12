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
    },
    key: ['id'],
    options: {
        timestamps: true,
    }
}