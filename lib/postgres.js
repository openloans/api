var pg = require('pg');
var app = process.app;
var db = module.exports = {};

db.connect = function (callback) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    callback(client, done);
  });
}

db.query = function (query, values, callback) {
  db.connect(function () {
    //client.query('SELECT $1::int AS numbor', ['1'], function(err, result) {
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        return callback(err);
      }

      callback(null, result.rows);
    });
  });
}
