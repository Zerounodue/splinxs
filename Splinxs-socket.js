/**
 * Created by Zerododici on 14.04.16.
 */
module.exports = exports = function(io) {
    var Guide = require('./models/guide');
    
    var splinxsList = require('./public/splinxsList/SplinxsList');

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
            
            //check if guide is same as in session
            if(socket.request.session.username != socket.username){
                if(showLogs) console.log('session username and socket name do not match');
                //TODO something useful...
                //send a request to redirect home? or simply do nothing at all
                return;
            }
            
            if (state == guideStates.available) {
                if (showLogs) console.log('Splinxs-socket: available, ' + socket.username);
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
                setGuideState(socket.username, guideStates.unavailable);
            }
        });
        
        socket.on(guideResponses.response, function(msg){
            if(showLogs) console.log('Splinxs-socket: guide response');
            
            //check if guide is same as in session
            if(socket.request.session.username != socket.username){
                if(showLogs) console.log('session username and socket name do not match');
                //TODO something useful...
                //send a request to redirect home? or simply do nothing at all
                return;
            }
            
            if(!msg || !msg.response){
                if(showLogs) console.log('Splinxs-socket: guide invalid response');
                return;
            }

            var res = msg.response;
            if(res == guideResponses.accept){
                if(showLogs) console.log('Splinxs-socket: guide accept, ' + socket.username);

                var item = splinxsList.getFirstGuide(socket.username);
                
                sendAcceptedMessageTourist(item.tourist, item.guide);
                setGuideState(g, guideStates.unavailable);
                
                splinxsList.removeGuide(socket.username);
                
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
            
            //check if tourist is same as in session
            if(socket.request.session.username != socket.username){
                if(showLogs) console.log('session username and socket name do not match');
                //TODO something useful...
                //send a request to redirect home? or simply do nothing at all
                return;
            }
            
            if(req == touristRequests.help){
                if(showLogs) console.log('Splinxs-socket: tourist help request, ' + socket.username);
                //check if values in session are correct
                if(socket.request.session){
                    var session = socket.request.session;
                    if(session.languages && session.lat && session.lng){
                        var lat = session.lat;
                        var lng = session.lng;
                        var langs = session.languages;
                        if(langs.length > 0 && isNumeric(lat) && isNumeric(lng)){
                            findMatchingGuide(socket.username, {lat: lat, lng: lng}, langs);
                        }
                        
                    }
                    
                }
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
                
        var list = [];
        //TODO find matching list in db and return array of guides
        //Guide.find(...);
        //list with guides that match the tourist
        
        var query = Guide.find({});

        query.where('languages', { $in: languages});

        query.exec(function (err, docs) {
          // called when the `query.complete` or `query.error` are called
          // internally
          debugger;
        });
        
        
        
        
        
        
        list.push('guide1');
        //add guide tourist pair to splinxs list and send help request to guide
        for(var i = 0; i < list.length; i++)
        {
            splinxsList.addStrings(list[i], tourist);
            sendGuideHelpRequest(list[i]);
        }
    }
    
    function sendGuideHelpRequest(g){
        sendHelpRequest(g);
    }   
   
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    
    
    
    
    
    
    
};
