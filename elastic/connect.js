const { Client } = require('@elastic/elasticsearch')

require('dotenv').config();

console.log(process.env.ELASTIC_CLOUD_ID);
module.exports.client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  }
})
