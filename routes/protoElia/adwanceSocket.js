var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var chat = io.of('/chat')
  .on('connection', function (socket) {
  	console.log('a user connected to chat');
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'		
    });
    chat.emit('a message', {
        everyone: 'in', '/chat': 'will get'
    });
    
    socket.on('a message', function(msg){
	  		console.log('server recived a message from chat a message: ' + msg);	  	
	  	});
  });

var news = io.of('/news')
  .on('connection', function (socket) {
  		console.log('a user connected to news');
  		news.emit('item', { news: 'item' });
  		
  		 socket.on('news', function(msg){
	  		console.log('server recived a message from news news: ' + msg);	  	
	  	});
  		
  });
  
 


http.listen(3000, function(){
  console.log('listening on *:3000');
});
