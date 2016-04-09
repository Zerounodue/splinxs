var express = require('express'),
	enforce = require('express-sslify'); //for redirect everything to ssh

var app = express();



// use HTTPS(true) in case you are behind a load balancer (e.g. Heroku) 
app.use(enforce.HTTPS());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;
