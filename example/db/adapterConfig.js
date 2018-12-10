module.exports = {
  default: {
    adapter: 'pg',
    dbconfig: {
      database: 'sample_db',
      user: 'george',
      password: '1234',
      port: 5432,
    },
  },
  User: {
    adapter: 'mongo',
    dbconfig: {
      database: 'sample_db',
    },
  },
  Shoe: {
    adapter: 'local',
  },
  Car: {
    adapter: 'mysql',
    dbconfig: {},
  },
};
