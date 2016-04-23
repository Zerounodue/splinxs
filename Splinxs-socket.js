/**
 * Created by Zerododici on 14.04.16.
 */
module.exports = exports = function(io) {
    var Guide = require('./models/guide');
    
    var showLogs = true;
    
    var guideStates = {
        state: "state",
        available: 1,
        unavailable: 2
    };
    
    var guideRequests = {
        request: "request",
        help: 1,
        cancel: 2,
        tooLate: 3
    };
    
    var guideResponses = {
        response: "response",
        accept: 1
    };
    
    var touristRequests = {
        request: "request",
        help: 1
    };
    
    var touristResponses = {
        response: "response",
        accepted: 1
    };

    var guideSocket = io.of('/guide');
    var touristSocket = io.of('/tourist');


    guideSocket.on('connection', function (socket) {
        if(showLogs) console.log('Splinxs-socket: guide connection');
        socket.on(guideStates.state, function(msg){
            if(!msg || !msg.state){
                if(showLogs) console.log('Splinxs-socket: guide invalid state');
                return;
            }
            if(!msg.name){
                if(showLogs) console.log('Splinxs-socket: guide no name');
                return;
            }
            var state = msg.state;
            socket.username = msg.name;
            if (state == guideStates.available) {
                if (showLogs)
                    console.log('Splinxs-socket: available, ' + socket.username);
                //sendHelpRequest(socket.username);
                if (socket.username) {
                    setGuideState(socket.username, guideStates.available);

                    /* to test cancel request
                     setTimeout(function(){
                     sendCancelRequest(socket.username);
                     }, 5000);
                     */
                }
            }else if(state == guideStates.unavailable){
                if(showLogs) console.log('Splinxs-socket: unavailable, ' + socket.username);
                //TODO set offline in db
                setGuideState(socket.username, guideStates.unavailable);
            }
        });
        
        socket.on(guideResponses.response, function(msg){
            if(showLogs) console.log('Splinxs-socket: guide response');
            
            if(!msg || !msg.response){
                if(showLogs) console.log('Splinxs-socket: guide invalid response');
                return;
            }
            
            var res = msg.response;
            if(res == guideResponses.accept){
                if(showLogs) console.log('Splinxs-socket: guide accept, ' + socket.username);
                
                //TODO get guide/tourist pair from list
                var g = socket.username;
                var t = "tourist1";
                
                //TODO remove guide from Splinxs list, 
                
                sendAcceptedMessageTourist(t, g);
                setGuideState(g, guideStates.unavailable);

                //TODO check if tourist still available
                //assume that tourist is not online
                /*
                //to test cancel request
                setTimeout(function(){
                    sendTooLateRequest(socket.username);
                }, 2500);
                */
               
            }
            
        });
        
        socket.on('disconnect', function () {
            if(showLogs) console.log('Splinxs-socket: guide disconnect: ' + socket.username);
            setGuideState(socket.username, guideStates.unavailable);
        });

    });
    
    function sendHelpRequest(g){
        sendMessageGuide(g, {request: guideRequests.help});
    }
    /*
    function sendCancelRequest(guide){
        sendMessageGuide(guide, {request: guideRequests.cancel});
    }
    */
    function sendTooLateRequest(g){
        sendMessageGuide(g, {request: guideRequests.tooLate});
    }
    
    function sendMessageGuide(g, msg){
        guideSocket.emit(g, msg);
    }

    function setGuideState(name, s){
        Guide.update({username: name}, {$set: {state: s}}, function (err, raw) {
            if (err) {
                //TODO might need to do something more?
                console.log('error setting guide state... guide: ' + name + ', state: ' + s);
                return handleError(err);
            }
        });
    }

    touristSocket.on('connection', function (socket) {
        if(showLogs) console.log('Splinxs-socket: tourist connection');
        
        socket.on(touristRequests.request, function(msg){
            if(showLogs) console.log('Splinxs-socket: tourist request');
            if(!msg || !msg.request){
                if(showLogs) console.log('Splinxs-socket: tourist invalid request');
                return;
            }
            if(!msg.name){
                if(showLogs) console.log('Splinxs-socket: tourist no name');
                return;
            }
            var req = msg.request;
            socket.username = msg.name;
            if(req == touristRequests.help){
                if(showLogs) console.log('Splinxs-socket: tourist help request, ' + socket.username);
                
                //TODO get tourist location and languages from session
                var loc = {lat: 5, lng: 5};
                var langs = ['de', 'en'];
                
                findMatchingGuide(socket.username, loc, langs);
            }
        });
        
    });
    
    function sendAcceptedMessageTourist(t, g){
        sendMessageTourist(t, {response: touristResponses.accepted, guide: g});
    }
    
    function sendMessageTourist(t, msg){
        touristSocket.emit(t, msg);
    }
    
    
    function findMatchingGuide(tourist, location, languages){
                
        
        //TODO find matching list in db and return array of guides
        //guide.find(...)...
        
        //TODO add list to queue
        //list.add()...
        
        //TODO give list to callback callback function to use: askGuidesForHelp()
        var list = ['guide1'];
        askGuidesForHelp(list);
        
        
        
    }
    
    function askGuidesForHelp(guides){
        //for each guide in list
        //sendHelpRequest(guide)...
        if(guides.length < 1){
            if(showLogs) console.log('Splinxs-socket: matching guides list < 1');
        }else{
            for(var i = 0; i < guides.length; i++){
                sendHelpRequest(guides[i]);
            }
        }
        
        
    }
    
    
    
    
    
    
    
    
    
    
};
