/**
 * Created by Zerododici on 14.04.16.
 */
module.exports = exports = function(io) {
    //io = io(server);
//var io = require('socket.io').listen(server);
    
    var showLogs = true;
    
    var guideStates = {
        state: "state",
        available: 1,
        unavailable: 2
    };
    
    var guideRequests = {
        request: "request",
        help: 1,
        cancel: 2
    };
    
    var guideResponses = {
        response: "response",
        accept: 1
    };

    var count =0;
/*
    io.sockets.on('connection', function (socket) {
        count ++;
        console.log('----------2: sockets connection count: '+count);

        socket.on('online', function (msg) {
            console.log('----------3: online: ');
        });
    });
*/


    var guideSocket = io.of('/guide');
    var touristSocket = io.of('/tourist');


    guideSocket.on('connection', function (socket) {
        if(showLogs) console.log('Splinxs-socket: connection');
        
        socket.on(guideStates.state, function(msg){
            if(!msg || !msg.state){
                if(showLogs) console.log('Splinxs-socket: invalid state');
                return;
            }
            if(!msg.name){
                if(showLogs) console.log('Splinxs-socket: no name');
                return;
            }
            var state = msg.state;
            socket.username = msg.name;
            if(state == guideStates.available){
                if(showLogs) console.log('Splinxs-socket: available, ' + socket.username);
                sendHelpRequest(socket.username);
                //TODO set online in db
                
                /* to test cancel request
                setTimeout(function(){
                    sendCancelRequest(socket.username);
                }, 5000);
                */
                
                
            }else if(state == guideStates.unavailable){
                if(showLogs) console.log('Splinxs-socket: unavailable, ' + socket.username);
                //TODO set offline in db
            }
        });
        
        socket.on(guideResponses.response, function(msg){
            if(showLogs) console.log('Splinxs-socket: response');
            
            if(!msg || !msg.response){
                if(showLogs) console.log('Splinxs-socket: invalid response');
                return;
            }
            
            var res = msg.response;
            if(res == guideResponses.accept){
                if(showLogs) console.log('Splinxs-socket: accept, ' + socket.username);
                //TODO remove guide from Splinxs list, send message to tourist, change state of guide in db
            }
            
        });

        socket.on('disconnect', function () {
            console.log('----------5.5: disconnect: ' + socket.username);
        });

    });
    
    function sendHelpRequest(guide){
        sendMessageGuide(guide, {request: guideRequests.help});
    }
    
    function sendCancelRequest(guide){
        sendMessageGuide(guide, {request: guideRequests.cancel});
    }
    
    function sendMessageGuide(guide, msg){
        guideSocket.emit(guide, msg);
    }

    touristSocket.on('connection', function (socket) {
        console.log('----------6: tourist connection opened');

    });

};