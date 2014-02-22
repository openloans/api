var express = require('express');
var app = process.app = express();
app.config = require('./config');
app.db = require('./lib/postgres');
require('./routes');
app.listen(app.config.port);
