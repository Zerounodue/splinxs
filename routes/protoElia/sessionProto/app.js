var express = require('express');

var session = require('express-session'); 
var path = require('path');

var app = express();


app.use(express.static(path.join(__dirname, 'public')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});




var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false

};
 

app.use(session(sessionOptions));

 

app.get("/", function(req, res){

  if ( !req.session.views){
    req.session.views = 1;
  }else{
    req.session.views += 1;
  }
 
  res.json({
    "status" : "ok",
    "frequency" : req.session.views
  });
});

 
app.listen(3300, function (){
  console.log("Server started at: http://localhost:3300");
});
