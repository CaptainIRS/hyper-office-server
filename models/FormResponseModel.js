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
        },
        status: {
            type: 'text',
            default: 'requested'
        },
        cid: {
            type: 'text',
            default: '',
        }
    },
    key: ['email', 'form'],
    options: {
        timestamps: true,
        versions: true,
    }
}