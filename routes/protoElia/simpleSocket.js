var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/tourist', function(req, res){
  res.sendFile(__dirname + '/tourist.html');	
});
app.get('/guide', function(req, res){
  res.sendFile(__dirname + '/guide.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});




var guideSocket = io.of('/guide');
  guideSocket.on('connection', function (socket) {
  		console.log('a guide has connected');
  		
  		
  		socket.on('online', function(msg){
	  		console.log('guide with username ' + msg +' is connected');	 
	  		console.log('TODO -> store online in DB');	  	 	
	  	});	
  });
  
  
var touristSocket = io.of('/tourist');
  touristSocket.on('connection', function (socket) {
  		console.log('a tourist has connected');
  		//create id
  		var tID=1234;
  		
  		
  		socket.on('online', function(msg){
	  		console.log('guide with username ' + msg +' is connected');	 
	  		console.log('TODO -> store online in DB');	  	 	
	  	});	
  });
  

http.listen(3000, function(){
  console.log('listening on *:3000');
});
