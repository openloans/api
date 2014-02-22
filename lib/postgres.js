var pg = require('pg');
var app = process.app;
var db = module.exports = {};

db.connect = function (callback) {
  pg.connect(app.config.postgres, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    callback(client, done);
  });
}

db.query = function (rawQuery, values, callback) {
  db.connect(function (client, done) {
    var query = {
      text: rawQuery,
      values: values
    };

    client.query(query, function (err, result) {
      done();

      if (err) {
        return callback(err);
      }

      callback(null, result.rows);
    });
  });
}
