/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

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
        tooLate: 3,
        touristClosedConnection: 4 
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
        accepted: 1,
        guideClosedConnection: 2
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
                //another guide already helped the tourist
                if(item == null){
                    if(showLogs) console.log('guide too late: ' + socket.username);
                    sendTooLateRequest(socket.username);
                //remove tourist from splinxsList, send guide name to tourist, set guide state to unavailable
                }else{
                    splinxsList.removeTourist(item.tourist);
                    sendAcceptedMessageTourist(item.tourist, item.guide);
                    setGuideState(item.guide, guideStates.unavailable);
                    //save guide in tourist socket
                    for(var t in touristSocket.sockets){
                        var s = touristSocket.sockets[t];
                        if(s.username == item.tourist){
                            s.guide = item.guide;
                            break;
                        }
                    }
                    //save tourist in guide socket
                    socket.tourist = item.tourist;
                }
                splinxsList.removeGuide(socket.username);
            }
            
        });
        
        socket.on('disconnect', function () {
            if(showLogs) console.log('Splinxs-socket: guide disconnect: ' + socket.username);
            setGuideState(socket.username, guideStates.unavailable);
            //send message to tourist that guide is offline
            if(socket.tourist){
                sendGuideClosedConnectionRequest(socket.tourist);
            }
            //guide logged out, can log in again
            var index = guideList.indexOf(socket.username);
            if(index > -1){
                guideList.splice(index, 1);
            }
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
    function sendTouristClosedConnectionRequest(g){
        sendMessageGuide(g, {request: guideRequests.touristClosedConnection});
    }
    /**
     * sends a message to a guide
     * @param {string} g guide to send message to 
     * @param {object} msg message to send
     */
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
        
        socket.on('disconnect', function () {
            if(showLogs) console.log('Splinxs-socket: tourist disconnect: ' + socket.username);
            //send message to guide that tourist is offline
            if(socket.guide){
                sendTouristClosedConnectionRequest(socket.guide);
            }
        });
        
    });
    
    function sendAcceptedMessageTourist(t, g){
        sendMessageTourist(t, {response: touristResponses.accepted, guide: g});
    }
    function sendGuideClosedConnectionRequest(t){
        sendMessageTourist(t, {response: touristResponses.guideClosedConnection});
    }
    /**
     * sends a message to a tourist
     * @param {string} t tourist to send message to
     * @param {object} msg message to send
     */
    function sendMessageTourist(t, msg){
        touristSocket.emit(t, msg);
    }
    
    /**
     * finds matching guides in the database, adds the guides found and the tourist in the queue (splinxsList), sends help request to guide
     * @param {string} tourist name of tourist
     * @param {{lat: number, lng: number}} location geolocation in lat and lng object
     * @param {[string]} languages array of 2 letter language codes
     */
    function findMatchingGuide(tourist, location, languages){
        //find matching guide in db
        Guide.find({languages: { $in: languages}, state: guideStates.available}, 'username areas', function(err, guides){
            if(err){
                console.log(err.msg);
            }
            //get matching guides
            for(var i = 0; i < guides.length; i++){
                var g = guides[i];
                if(g.isInArea(location)){
                    splinxsList.addStrings(g.username, tourist);
                    sendGuideHelpRequest(g.username);
                }
            }
        });
    }
    
    function sendGuideHelpRequest(g){
        sendHelpRequest(g);
    }   
    /**
     * checks if a given value is numeric
     * @param {object} n value to check
     * @returns {Boolean} true if numeric, false otherwise
     */
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    
    
    

};
