const sqlhelper = require('../sqlhelper/sqlhelper');

module.exports = (dbconfig = {}, name, model) => {
  const { Client } = require('pg');
  const client = new Client({
    // defaults
    host: '127.0.0.1',
    ...dbconfig,
  });

  const find = async options => {
    await client.connect();
    const res = await client.query(sqlhelper.createSELECT(name, model, options));
    await client.end();
    return sqlhelper.normalize('___')(res.rows);
  };

  return {
    find,
  };
};
