const cassandra = require('cassandra-driver');
var models = require('express-cassandra');
var path = require('path');
const contactPoints = [`${process.env.DB_HOST || 'localhost'}`];

modelsPath = path.normalize(path.join(__dirname, '..', 'models'));

function establishConnection() {
    models.setDirectory( modelsPath).bind({
            clientOptions: {
                contactPoints: contactPoints,
                localDataCenter: 'datacenter1',
                protocolOptions: { port: 9042 },
                keyspace: 'hyperoffice',
                authProvider: new models.driver.auth.PlainTextAuthProvider('cassandra', 'cassandra'),
                queryOptions: { consistency: models.consistencies.one },
                socketOptions: { readTimeout: 10000 }
            },
            ormOptions: {
                defaultReplicationStrategy: {
                    class: 'SimpleStrategy',
                    replication_factor: 1
                },
                migration: 'safe'
            }
        },
        function (err) {
            if (err) {
                console.log('Connection error', err);
                console.log("Retrying in 5 seconds...");
                setTimeout(establishConnection, 5000);
            } else {
                console.log('Connected to Cassandra');  
            }
        }
    )
}

establishConnection();

module.exports = models;
