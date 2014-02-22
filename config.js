
if (process.argv[2]) {
  module.exports = require(process.argv[2]);
  return;
}

module.exports = {
  port: 3000,
  postgres: {
    host: 'localhost',
    user: 'postgres',
    pass: 'postgres',
    port: 1234,
    db: 'openloans'
  }
};
