const adapters = require('./adapters');

function adapterCreateModel(adapterConfig = {}, name = '', model = {}) {
  const { adapter, dbconfig } = adapterConfig[name] || adapterConfig.default || {};

  if (!model) throw new Error(`Model not found: ${name}`);
  if (!adapter) {
    console.error('-- AdapterConfig --');
    console.error(adapterConfig);
    console.error('-- Error --');
    throw new Error(`Adapter not found for model: ${name}, check your adapterConfig`);
  }

  return {
    find: (where = '', options = {}) =>
      adapters[adapter](dbconfig, name, model).find({ where, ...options }),
  };
}

exports.createDB = ({ models, adapterConfig }) =>
  Object.keys(models).reduce(
    (_m, name) => ({
      ..._m,
      [name]: adapterCreateModel(adapterConfig, name, models[name]),
    }),
    {}
  );
