#!/usr/bin/env node
var fs = require('fs');
var csv = require('csv');
var pg = require('pg');
var db = {};

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

var columnNames = [
  'created_at', // convert, internal?
  'user_id',
  'user_dob', // convert
  'loan_id', // garbage?
  'original_principal',
  'current_principal',
  'rate', // what rate?
  'disbursement_date', // convert
  'maturity_date', // always blank
  'monthly_interest',
  'monthly_payment',
  'name',
  'status',
  'servicer',
  'type',
  '', // always blank

  // these should all be in a people table
  'education_status',
  'education_degree',
  'college',
  'major',
  'employment_status',
  'adjusted_gross_income',
  'joint_federal_income_tax', // bool
  'spouse_adjusted_gross_income',
  'employer_type',
  'profession',
  'family_size',
  'state_residency',
  'credit_score',
  'situation'
];

var dateColumns = [
  'created_at',
  'user_dob',
  'disbursement_date'
];

var loans = [];
var valueOptions = {};
var people = {};

csv()
  .from.path(__dirname + '/../data/SLH-Data-3.21.2014.csv', { delimiter: ',', escape: '"' })
  .transform(function (rawRow) {
    var row = {};
    var person = {};

    for (var i in rawRow) {
      var column = columnNames[i];
      if (!column) continue; // handle ''
      if (i < 15) {
        row[column] = rawRow[i];
      } else {
        person[column] = rawRow[i];
      }
    }

    for (var i in dateColumns) {
      var column = dateColumns[i];
      row[column] = parseDate(row[column]);
    }

    delete row.maturity_date;
    person.person_id = row.user_id;
    row.person_id = row.user_id;
    delete row.user_id;
    person.dob = row.user_dob;
    delete row.user_dob;
    people[person.person_id] = person;

    return row;
  })
  .on('record', function (row, index) {
    if (index === 0) return; // drop the column names

    row.loan_id = index;
    loans.push(row);

return;
    for (var column in optionColumns) {
      var value = row[column];
      if (!value) return;

      if (!valueOptions[column]) {
        valueOptions[column] = {};
      }

      if (!valueOptions[column][value]) {
        valueOptions[column][value] = 1;
      } else {
        valueOptions[column][value]++;
      }
    }
  })
  .on('end', function (count) {
    console.log('Number of lines: ' + count);
    insertLoans();
  })
  .on('error', function (error) {
    console.log(error.message);
  });

function parseDate (raw) {
  var date = new Date();
  var parts = raw.split('/');

  date.setMonth(parseInt(parts[0]));
  date.setDate(parseInt(parts[1]));

  var assumption = 1900;
  if (parts[2] < 15) {
    assumption = 2000;
  }

  date.setFullYear(assumption + parseInt(parts[2]));

  return date;
}

function insertLoans () {
  if (!loans.length) {
    console.log('done');
    return;
  }

  var loan = loans.pop();
  insertLoan(loan, insertLoans);
}

function insertLoan (loan, callback) {
  var columns = Object.keys(loan);
  var values = [];

  for (var i in loan) {
    values.push(loan[i]);
  }

  var query = 'insert into loans (' + columns.join(',') + ') values $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13'; // getting really sick of this script

  db.query(query, values, function () {
    console.log(arguments);

    // avoid blowing up the call stack
    setTimeout(function () {
      callback();
    }, 1);
  });

}
