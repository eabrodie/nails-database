'use strict';

var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.engine('jade', require('jade').renderFile);

app.get('/', function(req, res, next){
  res.render('index.jade');
});

app.listen(3000);