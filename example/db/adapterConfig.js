module.exports = {
  default: {
    adapter: 'pg',
    dbconfig: {
      database: 'example',
      user: 'root',
      password: '1234',
      port: 5432,
    },
  },
  User: {
    adapter: 'mongo',
    dbconfig: {
      database: 'mydb',
    },
  },
  Shoe: {
    adapter: 'local',
  },
};
