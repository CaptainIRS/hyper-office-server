module.exports = {
    fields: {
        email: {
            type: 'text',
        },
        password: {
            type: 'text',
        },
        name: {
            type: 'text',
        }
    },
    key: ['email'],
    options: {
        timestamps: true,
        versions: true,
    }
}