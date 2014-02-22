#!/usr/bin/env node
var fs = require('fs');
var csv = require('csv');
var pg = require('pg');
var config = require('../config');
var db = {};

db.connect = function (callback) {
  pg.connect(config.postgres, function(err, client, done) {
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

var numericColumns = [
  'original_principal',
  'current_principal',
  'monthly_interest',
  'monthly_payment',
  'rate'
];

var personNumericColumns = [
  'adjusted_gross_income',
  'spouse_adjusted_gross_income',
  'family_size'
];

var loans = [];
var people = {};

console.log('parsing csv...');
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

    for (var i in numericColumns) {
      var column = numericColumns[i];
      row[column] = parseFloat(row[column]);

      if (isNaN(row[column])) {
        row[column] = null;
      }
    }

    for (var i in personNumericColumns) {
      var column = personNumericColumns[i];
      person[column] = parseFloat(person[column]);

      if (isNaN(person[column])) {
        person[column] = null;
      }
    }

    if (person.joint_federal_income_tax == 'TRUE') {
      person.joint_federal_income_tax = true;
    } else if (person.joint_federal_income_tax == 'FALSE') {
      person.joint_federal_income_tax = false;
    } else {
      person.joint_federal_income_tax = null;
    }

    delete row.maturity_date;
    person.person_id = row.user_id;
    row.person_id = row.user_id;
    delete row.user_id;
    person.dob = row.user_dob;
    delete row.user_dob;

    // can't find a better way to drop the first row for people
    if (person.person_id == 'User ID #') {
      return row;
    }

    // store them in an object so we get uniques
    people[person.person_id] = person;

    return row;
  })
  .on('record', function (row, index) {
    if (index === 0) return; // drop the column names
    row.loan_id = index;
    loans.push(row);
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

  if (parts.length != 3) {
    return null;
  }

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
    people = valuesToArray(people);
    insertPeople();
    return;
  }

  var loan = loans.pop();
  insertLoan(loan, insertLoans);
}

function insertLoan (loan, callback) {
  console.log('inserting loan', loan.loan_id);

  var columns = Object.keys(loan);
  var values = [];

  for (var i in loan) {
    values.push(loan[i]);
  }

  var query = 'insert into loans (' + columns.join(',') + ') values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)'; // better way to do that?

  db.query(query, values, function (err) {
    if (err) {
      console.log(loan);
      return console.log(err);
    }

    // avoid blowing up the call stack
    setTimeout(function () {
      callback();
    }, 1);
  });
}

function insertPeople () {
  if (!people.length) {
    console.log('done!');
    process.exit();
  }

  var person = people.pop();
  insertPerson(person, insertPeople);
}

function insertPerson (person, callback) {
  console.log('inserting person', person.person_id);

  var columns = Object.keys(person);
  var values = [];

  for (var i in person) {
    values.push(person[i]);
  }

  var query = 'insert into people (' + columns.join(',') + ') values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)'; // better way to do that?

  db.query(query, values, function (err) {
    if (err) {
      console.log(person);
      return console.log(err);
    }

    // avoid blowing up the call stack
    setTimeout(function () {
      callback();
    }, 1);
  });
}

function valuesToArray(obj) {
  return Object.keys(obj).map(function (key) { return obj[key]; });
}
