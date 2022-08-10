const cassandra = require('cassandra-driver');

const contactPoints = [`${process.env.DB_HOST || 'localhost'}:9042`];
const client = new cassandra.Client({
    contactPoints: contactPoints,
    localDataCenter: 'datacenter1',
    credentials: { username: 'cassandra', password: 'cassandra' },
    socketOptions: { readTimeout: 1000 }
});

function connect() {
    return new Promise(function (resolve, reject) {
        client.connect().then(function () {
            resolve();
        }).catch(function (err) {
            reject(err);
        });
    });
}

function establishConnection() {
    connect().then(function () {
        console.log('Cassandra connected');
    }).catch(function (err) {
        console.log('Cassandra connection error: %s', err.message);
        console.log('Could not connect to Cassandra, retrying in 5 seconds');
        setTimeout(function () {
            establishConnection();
        }, 5000);
    });
}

establishConnection();

module.exports = client;
