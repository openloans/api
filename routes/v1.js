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
