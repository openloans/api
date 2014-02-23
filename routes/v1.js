var app = process.app;

app.get('/v1/people', function (req, res) {
  var query = 'select * from people';

  app.db.query(query, null, function (err, rows) {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        error: 'Database error'
      });
    }

    res.send({
      success: true,
      results: rows
    });
  });
});

app.get('/v1/loans', function (req, res) {
  var params = [];
  var query = 'select * from loans';

  if (req.query.before) {
    if (isNaN(parseInt(req.query.before))) {
      return res.send({
        success: false,
        error: 'Invalid timestamp for before'
      });
    }

    params.push('disbursement_date < \'' + new Date(parseInt(req.query.before)).toISOString() + '\'::date');
  }

  if (req.query.after) {
    if (isNaN(parseInt(req.query.after))) {
      return res.send({
        success: false,
        error: 'Invalid timestamp for after'
      });
    }

    params.push('disbursement_date > \'' + new Date(parseInt(req.query.after)).toISOString() + '\'::date');
  }

  if (params.length) {
    query += ' where ' + params.join(' and ');
  }

  app.db.query(query, null, function (err, rows) {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        error: 'Database error'
      });
    }

    res.send({
      success: true,
      results: rows
    });
  });
});

app.get('/v1/person/:id', function (req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.send({
      success: false,
      error: 'Invalid id'
    });
  }

  var query = 'select * from people where person_id = $1';
  var values = [ id ];
  app.db.query(query, values, function (err, results) {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        error: 'Database error'
      });
    }

    if (!results.length) {
      return res.send({
        success: false,
        error: 'Person does not exist'
      });
    }

    res.send({
      success: true,
      person: results[0]
    });
  });
});

app.get('/v1/loan/:id', function (req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.send({
      success: false,
      error: 'Invalid id'
    });
  }

  var query = 'select * from loans where loan_id = $1';
  var values = [ id ];
  app.db.query(query, values, function (err, results) {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        error: 'Database error'
      });
    }

    if (!results.length) {
      return res.send({
        success: false,
        error: 'Loan does not exist'
      });
    }

    res.send({
      success: true,
      loan: results[0]
    });
  });
});
