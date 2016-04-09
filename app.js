var express = require('express'),
	session = require('express-session'), //session (required also for i18n)
	geolang=require("geolang-express"), //i18n
	i18n=require("i18n-express");//i18n
	//enforce = require('express-sslify'); //for redirect everything to ssh
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//mongo db stuff
var mongoose = require("mongoose");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
//var routes = require('./routes/index2');
var users = require('./routes/users');

var app = express();

//new 
var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false

};
app.use(session(sessionOptions));
//

// use HTTPS(true) in case you are behind a load balancer (e.g. Heroku) 
//app.use(enforce.HTTPS());

//geolang
app.use(geolang({
  siteLangs: ["en","it","de"],
  cookieLangName: 'ulang'
}));
//

//i18N

app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path. 
  siteLangs: ["en","it","de"],
  cookieLangName: 'ulang'
}));

//


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//this is new: doese i need that????
//app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/public/tourist'));
//app.use(express.static(__dirname + '/public/guide'));
//
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//new for mongo db
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/tourist')));
app.use(express.static(path.join(__dirname, 'public/guide')));



// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//mongo db stuff
//http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VwaB16R96Uk
//complete tutorial
//https://www.airpair.com/javascript/complete-expressjs-nodejs-mongodb-crud-skeleton

mongoose.set('debug', true);
mongoose.connect("mongodb://localhost:27017/test");

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("Connection succeeded.");
});


app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
