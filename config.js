
if (process.argv[2]) {
  module.exports = require(process.argv[2]);
  return;
}

module.exports = {
  port: 3000,
  postgres: {
    host: 'localhost',
    user: 'openloans',
    password: 'openloans_test_password',
    database: 'openloans',
    port: 5432
  }
};
