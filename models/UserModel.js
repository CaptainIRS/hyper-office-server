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
        },
        role: {
            type: 'text',
            default: 'User',
        }
    },
    key: ['email'],
    options: {
        timestamps: true,
        versions: true,
    }
}