const database = {};
const { keys } = Object;

module.exports = (dbconfig, name, model) => {
  const find = async ({ where = {}, projection = [], limit } = {}) => {
    return (database[model.__table] || [])
      .filter(
        item =>
          keys(where).length === 0 ||
          keys(where) // where: { name: '1', createdAt: 'date' }
            .map(cond => item[cond] === where[cond])
            .filter(Boolean).length !== 0
      )
      .map(item =>
        keys(item)
          .filter(prop => projection.length === 0 || projection.indexOf(prop) !== -1)
          .reduce((_item, prop) => ({ ..._item, [prop]: item[prop] }), {})
      )
      .slice(0, limit);
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
