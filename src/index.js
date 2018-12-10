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
  const Model = adapters[adapter](dbconfig, name, model);

  return {
    find: (where, options) => Model.find({ where, ...options }),
    create: (payload, options) => Model.insert({ payload, ...options }),
    insert: (payload, options) => Model.insert({ payload, ...options }),
    upsert: (payload, options) => Model.upsert({ payload, ...options }),
    update: (where, payload, options) => Model.update({ where, payload, ...options }),
    delete: (where, options) => Model.delete({ where, ...options }),
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
