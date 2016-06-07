/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

var express = require('express'),
session = require('express-session'), //session (required also for i18n)
i18n = require('./i18n'); //mashpie i18n-node module https://github.com/mashpie/i18n-node/
socket_io = require('socket.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//mongo db stuff
var mongoose = require("mongoose");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();
var io = socket_io();
app.io = io;

//stores logged in guides
guideList = [];

/**
 *Signaling-server for RTCMultiConnection
 */
require('./Signaling-Server.js')(io, function (socket) {
    try {
        var params = socket.handshake.query;
        var added = false;

        if (!params.socketCustomEvent) {
            return;
        } else {
            //for guides
            addEvent(params.socketCustomEvent);
            console.log("guide event: " + params.socketCustomEvent);
        }
        //For Tourist's allows to add one additional event (for websocket chat with guide)
        socket.on('addEvent', function (msg) {
            if (added) return;
            if (!msg || !msg.event) return;
            var event = msg.event;
            if (typeof event !== 'string') return;
            addEvent(event);
            added = true;
        });
    } catch (e) {}

    function addEvent(event) {
        socket.on(event, function (message) {
            try {
                socket.broadcast.emit(event, message);
            } catch (e) {
            }
        });
    }

});

/**
 * Listen on provided port, on all network interfaces.
 */

require('./Splinxs-socket.js')(io);

var sessionMiddleware = session({
    secret: "SplinxsSecret",
    resave: true,
    saveUninitialized: false
});
//http://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
app.io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(i18n);

//routes
var routes = require('./routes/index');
var tourist = require('./routes/tourist');
var guide = require('./routes/guide');

//new for mongo db
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// passport config
var Guide = require('./models/guide');
passport.use(new LocalStrategy(Guide.authenticate()));
passport.serializeUser(Guide.serializeUser());
passport.deserializeUser(Guide.deserializeUser());

//mongo db stuff
//http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VwaB16R96Uk
//complete tutorial
//https://www.airpair.com/javascript/complete-expressjs-nodejs-mongodb-crud-skeleton

mongoose.set('debug', true);
mongoose.connect("mongodb://localhost:27017/splinxs");

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("Connection succeeded.");
});

app.use('/', routes);
app.use('/', tourist);
app.use('/', guide);

//app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// --- error handlers

// development error handler will print stacktrace
//TODO comment this section for production mode
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
