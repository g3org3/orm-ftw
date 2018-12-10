const { createDB } = require('../../src');

const models = require('./models');
const adapterConfig = require('./adapterConfig');

module.exports = createDB({ models, adapterConfig });
