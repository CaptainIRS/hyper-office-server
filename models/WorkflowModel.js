module.exports = {
    fields: {
        id: "uuid",
        name: "text",
        state: {
            type: "frozen",
            typeDef: "<list <state>>"
        },
    },
    key: ["id"]
}
