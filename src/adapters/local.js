const database = {};
const { keys } = Object;
module.exports = (dbconfig = {}, name, model) => {
  const find = async ({ where = {} } = {}) => {
    if (keys(where).length === 0) return database[model.__table];
    return database[model.__table].filter(
      item =>
        // where: { name: '1', createdAt: 'date' }
        keys(where)
          .map(cond => item[cond] === where[cond])
          .filter(Boolean).length !== 0
    );
  };

  const insert = async ({ payload } = {}) => {
    const item = { id: Date.now(), ...payload };
    if (database[model.__table]) database[model.__table].push(item);
    else database[model.__table] = [item];
    return item;
  };

  return {
    find,
    insert,
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
