var express = require('express'),
	session = require('express-session'), //session (required also for i18n)
	geolang=require("geolang-express"), //i18n
    socket_io = require('socket.io'),
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



var app = express();
var io = socket_io();
app.io = io;



/**
 *Signaling-server for RTCMultiConnection
 */
require('./Signaling-Server.js')(io, function (socket) {
    try {
        var params = socket.handshake.query;
        var added = false;
        //TODO remove comments
        // "socket" object is totally in your own hands!
        // do whatever you want!

        // in your HTML page, you can access socket as following:
        // connection.socketCustomEvent = 'custom-message';
        // var socket = connection.getSocket();
        // socket.emit(connection.socketCustomEvent, { test: true });


        if (!params.socketCustomEvent) {
            //params.socketCustomEvent = 'custom-message';
            return;
        } else {
            //for guides
            addEvent(params.socketCustomEvent);
            console.log("guide event: " + params.socketCustomEvent);
        }


        //for tourists
        //allows to add one additional event (for websocket chat with guide)
        socket.on('addEvent', function (msg) {
            if (added) return;
            if (!msg || !msg.event) return;
            var event = msg.event;
            if (typeof event !== 'string') return;
            addEvent(event);
            added = true;
        });

    } catch (e) {
    }

    function addEvent(event) {
        socket.on(event, function (message) {
            //TODO delete when everything works
            console.log('-----rmc signalling server: event, ' + event + ', message, ' + message);
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




/*
var sessionOptions = {
  //TODO change secret and option
  secret: "secret",
  resave : true,
  saveUninitialized : false
};
*/

var sessionMiddleware = session({
    //TODO change secret and option
    secret: "secret",
    resave: true,
    saveUninitialized: false
});
//http://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
app.io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

//app.use(session(sessionOptions));

app.use(sessionMiddleware);

//var routes = require('./routes/index');
var routes = require('./routes/index2');
var tourist = require('./routes/tourist');
var guide = require('./routes/guide');

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


/*
// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
*/

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
