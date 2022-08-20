module.exports = {
    fields: {
        email: {
            type: 'text',
        },
        form: {
            type: 'uuid'
        },
        data: {
            type: 'ascii'
        }
    },
    key: ['email', 'form'],
    options: {
        timestamps: true,
        versions: true,
    }
}