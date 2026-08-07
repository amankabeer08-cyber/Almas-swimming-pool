const serverless = require('serverless-http');
const app = require('../../backend/server');

const expressHandler = serverless(app);

exports.handler = async (event, context) => {
    return expressHandler(event, context);
};
