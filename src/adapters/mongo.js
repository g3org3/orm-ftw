//  npm install mongodb --save
module.exports = (dbconfig = {}, name, model) => {
  const { MongoClient } = require('mongodb');

  const { host = 'localhost', port = 27017, database = 'test' } = dbconfig;
  const url = `mongodb://${host}:${port}`;
  delete dbconfig.host;
  delete dbconfig.port;
  delete dbconfig.database;

  const find = async (options = {}) => {
    const client = await MongoClient.connect(
      url,
      { ...dbconfig, useNewUrlParser: true }
    );
    const collection = client.db(database).collection(model.__table);
    const { where } = options;
    delete options.where;
    const data = await collection.find(where || {}, options).toArray();
    client.close();

    return await data;
  };

  return {
    find,
    insert: () => {
      throw new Error('insert is not implemented yet :(');
    },
    upsert: () => {
      throw new Error('upsert is not implemented yet :(');
    },
    update: () => {
      throw new Error('update is not implemented yet :(');
    },
    delete: () => {
      throw new Error('delete is not implemented yet :(');
    },
  };
};
