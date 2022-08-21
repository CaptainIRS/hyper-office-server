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
        cid: {
            type: 'text',
            default: '',
        },
        stage: 'int',
        isDone: 'boolean',
        id: 'uuid',
        nextDesignation: 'text',
    },
    key: ['id'],
    options: {
        timestamps: true,
        versions: true,
    }
}