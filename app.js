var config = require('./config');
var express = require('express');
var app = process.app = express();
require('./routes');
app.listen(config.port);
