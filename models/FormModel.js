module.exports = {
    fields: {
        name: {
            type: 'varchar',
        },
        data: {
            type: 'ascii',
        }
    },
    key: ['name'],
    options: {
        timestamps: true,
    }
}