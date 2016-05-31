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
 * guide.connection.js
 * contains functions related with the connection on the guide side
 * used by guides
 */

//variables
showLogs = true;

var c2P = false; //connected to peer

var guideSocket;
var guideStates = {
    state: "state",
    available: 1,
    unavailable: 2
};
var guideRequests = {
    help: 1,
    cancel: 2,
    tooLate: 3,
    touristClosedConnection: 4 
};

var guideResponses = {
    response: "response",
    accept: 1
};

var ongoingConnectionInterval;
var ongoingConnectionIntervalTimer = 60 * 1000; //60 seconds

//guide channel
var channel;
var audioStream = null;
var peerAudioStream = null;

function initGuideConnection(){
    if(showLogs) console.log('init guide connection');    
    channel = username;

    //TODO check if this works

    //if(!supportsOnlyWebsocket()){

        initGuideWebRTC();
    //}
    //connection.channel = channel;
    //connection.socketCustomEvent = connection.channel;
    initGuideSocket();
}

function initGuideWebRTC(){
    if(showLogs) console.log("guide: init guide WebRTC");
    connection = new RTCMultiConnection();
    connection.socketURL = '/';
    connection.channel = channel;
    connection.socketCustomEvent = connection.channel;
    
    
    if (typeof webkitMediaStream !== 'undefined') {
        connection.attachStreams.push(new webkitMediaStream());
    }
    else if (typeof MediaStream !== 'undefined') {
        connection.attachStreams.push(new MediaStream());
    }
    else {
        console.error('Neither Chrome nor Firefox. This demo may NOT work.');
    }
    

    connection.dontCaptureUserMedia = true;

    connection.session = {
        data: true
        //audio: 'two-way'
       // data: true
        ,audio: true
        //,video: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    //only when webRTC available
    if(DetectRTC.browser.isChrome || DetectRTC.browser.isFirefox || DetectRTC.browser.isOpera){
        connection.open(connection.channel);
    }

    //connection.videosContainer = $("#videoContainer");

    initGuideWebRTCEvents();
}

function initGuideWebRTCEvents(){
    if(showLogs) console.log("guide: init guide WebRTC events");
    connection.onopen = function (event) {
        if (showLogs) console.log('guide: connection opened in channel: ' + connection.channel);

        if (connection.alreadyOpened) return;
        connection.alreadyOpened = true;
        startAudioStream();
        showAudioVideoIcons();
    };


    connection.onmessage = function (message) {
        if (showLogs) console.log('guide: sctp message arrived');
        if (!message.data) {
            if (showLogs) console.log('guide: empty sctp message');
            return;
        }
        onMessage(message.data);
    };

    connection.onstream = function (event) {
        if (showLogs) console.log('guide: stream started');
        if (!event.stream.getAudioTracks().length && !event.stream.getVideoTracks().length) {
            return;
        }

        if(event.stream.type == "local"){
            if (showLogs) console.log('guide: local stream started');
            
            if(audioStream == null){
                if (showLogs) console.log('guide: local audio stream started');
                audioStream = event.stream.id;
            }
            /*
            if(event.stream.isAudio){
                if (showLogs) console.log('guide: local audio stream started');
                /*
                connection.videosContainer.append(event.mediaElement);
                event.mediaElement.play();
                setTimeout(function () {
                    event.mediaElement.play();
                }, 2000);
                */
               /*
            }
            */

        }else if(event.stream.type == "remote"){
            //if (showLogs) console.log('guide: remote stream started');
            /*
            if(peerAudioStream == null){
                peerAudioStream = event.stream.id;
                if (showLogs) console.warn('guide: remote audio stream started');
                var audio = $("#audioDiv");
                audio.append(event.mediaElement);
            }else{
            */
            /*
                if (showLogs) console.log('guide: remote video stream started');
                //TODO do other things?
                event.mediaElement.controls=true;
                event.mediaElement.autoplay=true;
                event.mediaElement.volume = 1;

                var video = $("#videoContainer");
                video.append(event.mediaElement);




                showVideo();
                */


            if (showLogs) console.warn('guide: remote audio stream started');
            var audio = $("#audioDiv");
            audio.append(event.mediaElement);
            event.mediaElement.controls = true;
            event.mediaElement.autoplay = true;
            event.mediaElement.volume = 1;
            //}
            
            /*
            if(event.stream.isVideo){
                if (showLogs) console.log('guide: remote video stream started');
                //TODO do other things?
                event.mediaElement.controls=false;
                event.mediaElement.autoplay=true;

                //connection.videosContainer.append(event.mediaElement);

                var video = $("#videoContainer");
                video.append(event.mediaElement);
                showVideo();
            }else if(event.stream.isAudio){
                if (showLogs) console.log('guide: remote audio stream started');
                var audio = $("#audioDiv");
                audio.append(event.mediaElement);


                
                
                event.mediaElement.play();
                setTimeout(function () {
                    event.mediaElement.play();
                }, 2000);
                
            }
            */
        }

    };
    
    connection.onmute = function (event) {
        //to set a picture instead of the last printscreen
        //e.mediaElement.setAttribute('poster', 'photo.jpg');
        event.mediaElement.pause();
    };

    connection.onunmute = function (event) {
        //to remove picture set in onmute
        //e.mediaElement.removeAttribute('poster');
        event.mediaElement.play();
    };
    
    
    connection.onstreamended = function (event) {
        if(showLogs) console.log('guide: stream ended');
        
        if(event.stream.type == "remote"){
            //TODO better do with hammer thingy?
            $("#videoContainer").empty();
            //$("#videoContainer").hide();

            stopStream();
        }
        
        //$("#videoContainer").empty();

        //event.mediaElement.remove();

        /*
        connection.attachStreams.forEach(function (stream) {
            stream.stop();
        });
        */
        
    };
    

    /**
     * fires when the signalling websocket was connected successfully
     * this socket will be used as a fall back if SCTP is not available
     * @param {Websocket} socket Websocket used for signalling and sending other messages
     */
    connection.connectSocket(function (socket) {
        if (showLogs) console.log('guide: websocket connected, custom event: ' + connection.socketCustomEvent);
        websocket = socket;

        // listen custom messages from server
        websocket.on(connection.socketCustomEvent, function (message) {
            if (showLogs) console.log('guide: websocket message arrived');
            if (!message.customMessage) {
                if (showLogs) console.log('guide: empty websocket message');
                return;
            }
            //message that peer only supports websockets => I will use only websockets too
            if(message.customMessage.connection){
                if (showLogs) console.log('guide: peer only supports websockets, will do the same');
                connectionState.DataChannel = connectionStates.DataChannel.Websocket;
                return;
            }
            onMessage(message.customMessage);
        });
    });
}

/**
 * checks what kind of message arrived and acts accordingly
 * @param {String} message message sent by peer
 */
function onMessage(message) {
    if (message.map){
        mapMessage(message.map);
        return;
    }
    if (message.typing) {
        if (showLogs) console.log('guide: peer typing');
        peerIsTyping(peername);
        return;
    }
    if (message.stoppedTyping) {
        if (showLogs) console.log('guide: peer stopped typing');
        peerStoppedTyping();
        return;
    }
    if (message.username) {
        if (showLogs) console.log('guide: peername: ' + message.username);
        //send message to peer if I do not support sctp
        if(supportsOnlyWebsocket()){
            sendUseWebsocketConnection();
        }
        
        peername = message.username;
        sendUsername(username);
        showChatMapGUI();
        informServerOngoingConnection();
        //set param on db that guide is connected to tourist
        ongoingConnectionInterval = setInterval(function () {
            informServerOngoingConnection();
        }, ongoingConnectionIntervalTimer);
        //connection with tourist started
        c2P = true;
        setUnavailable();
        
        return;
    }
    //tourist closed the connection
    if(message.closeConnection){
        connectionClosed();
        return;
    }
    messageArrived(message);
}
/**
 * handles different data sent by the peer to make changes on the map
 * @param {Object} mapMessage contains the map data
 */
function mapMessage(mapMessage) {
    if (mapMessage.tourist) {
        var tourist = mapMessage.tourist;
        if (showLogs) console.log('guide: map geo');
        if (tourist.pos) {
            var pos = tourist.pos;
            if(pos.lat && pos.lng){
                if (showLogs) console.log('guide: map location, lat: ' + pos.lat + " lng: " + pos.lng);
                setTouristLocation(pos);
            }else{
                if(showLogs) console.warn('invalid location: ' + pos);
            }
        }
        if (tourist.orientation > -1) {
            var orientation = tourist.orientation;
            if (showLogs) console.log('guide: map orientation: ' + orientation);
            setTouristOrientation(orientation);
        }
    } else if (mapMessage.marker) {
        var marker = mapMessage.marker;
        if (showLogs) console.log('guide: map marker');
        if(marker.add){
            if (showLogs) console.log('guide: add marker');
            var id = marker.id;
            var pos = marker.pos;
            if(id > -1 && pos){
                if(pos.lat && pos.lng){
                    addTouristsMarker(id, pos);
                }else{
                    if(showLogs) console.warn('invalid lcoation: ' + pos);
                }
            }else{
                if(showLogs) console.warn('invalid marker id: ' + id + ' pos: ' + pos);
            }
        }
        if(marker.rem){
            if (showLogs) console.log('guide: rem marker');
            var id = marker.id;
            if(id > -1){
                removeMarker(id);
            }else{
                if(showLogs) console.warn('invalid id to remove marker: ' + id);
            }
        }
    }
}
/**
 * send a message to the tourist that the connection request was accepted
 * clear the timeout
 */
function guideAcceptsRequest(){
    guideSocketSendResponse(guideResponses.accept);
    clearTimeout(conEstabTimeout);
    conEstabTimeout = null;
}
/**
 * send a message to the tourist that the connection request was declined
 * clear the timeout
 */
function guideDeclinesRequest(){
    sendGuideDeclinesRequest();
    clearTimeout(conEstabTimeout);
    conEstabTimeout = null;
}

function informServerOngoingConnection(){
    if(showLogs) console.log('guide: informing server that connection is ongoing');
    //TODO save in db timestamp of ongoing connection
}
/**
 * stopps the guide from sending messages to the server that a connection is ongoing
 */
function ongoingConnectionClosed(){
    if(showLogs) console.log('guide: ongoing connection closed normally');
    clearInterval(ongoingConnectionInterval);
}

function initGuideSocket(){
    if(showLogs) console.log('guide: init guideSocket');
    guideSocket = io.connect('https://splinxs.ti.bfh.ch/guide');
    //guideSocket = io.connect('https://localhost/guide');
    
    initEvents();
}

function initEvents(){
    if(showLogs) console.log('guide: init guideSocket evetns');
    
    guideSocket.on('connect', function(){
        if(showLogs) console.log('guide: guideSocket connect');
        guideSocketSendState(guideStates.available);
    });
    
    guideSocket.on(username, function(msg){
        if(showLogs) console.log('guide: guideSocket message on: ' + username);

        if(!msg){
            if(showLogs) console.log('guide: guideSocket invalid message');
            return;
        }
        if(msg.request){
            var req = msg.request;
            if(req == guideRequests.help){
                if(showLogs) console.log('guide: guideSocket help request');
                //if guide is already c2P, don't show prompt to help
                if(c2P) return;
                showTouristRequestsGuidePrompt();
                //hide prompt after timeout (tourist will try to connect to new guide)
                //=> I mustn't see the prompt anymore
                conEstabTimeout = setTimeout(function () {
                    if(showLogs) console.log('tourist: tourist request timeout');
                    hideTouristRequestGuidePrompt();
                }, conEstabTimer);
                return;
            }else if(req == guideRequests.cancel){
                if(showLogs) console.log('guide: guideSocket cancel request');
                hideTouristRequestGuidePrompt();
                return;
            }else if(req == guideRequests.tooLate){
                if(showLogs) console.log('guide: guideSocket tooLate request');
                alert('__you are too late, another guide helped the tourist');
            }else if(req == guideRequests.touristClosedConnection){
                if(!c2P) return; //connection should already be closed
                if(showLogs) console.log('guide: guideSocket tourist closed connection request');
                alert('__Tourist left connection in a mean way...');
                connectionClosed();
            }
        }

    });
}

function guideSocketSendResponse(r){
    guideSocketSendMessage(guideResponses.response, {response: r, name: username});
}

function guideSocketSendState(s){
    guideSocketSendMessage(guideStates.state, {state: s, name: username});
}

function guideSocketSendMessage(topic, msg){
    if(showLogs) console.log('guide: guideSocket send on: ' + topic + ', message: ' + msg);
    guideSocket.emit(topic, msg);
}

function connectionClosed() {
    if (showLogs) console.log('guide: connection closed by tourist');
    c2P = false;
    //TODO put all in function in guide ui
    hideChat();
    emptyChat();
    hideMap();
    deleteAllMarkers();
    hideVideo();
    hideAudioVideoIcons();
    showWaitingBox();
    stopStream();
    connection.alreadyOpened = false;
    
    //check again what the guide's browser is capable of
    detectRTCcapabilities();
}

function closeConnection(){
    if (showLogs) console.log('guide: closing tourist connection');
    sendCloseConnection();
    connectionClosed();
}

function startAudioStream(){
    connection.dontCaptureUserMedia = false;
    if (connection.attachStreams.length) {
        connection.getAllParticipants().forEach(function (p) {
            connection.attachStreams.forEach(function (stream) {
                connection.peers[p].peer.removeStream(stream);
            });
        });
        connection.attachStreams = [];
    }

    connection.addStream({
        audio: true
    });
}

function stopStream(){
    /*
    if (connection.attachStreams.length) {
        connection.getAllParticipants().forEach(function (p) {
            connection.attachStreams.forEach(function (stream) {
                connection.peers[p].peer.removeStream(stream);
            });
        });

        connection.attachStreams.forEach(function (stream) {
            stream.stop();
        });

        connection.attachStreams = [];
        
        if (c2P) {
            //connection.renegotiate();
        }
    }
    */
   
    connection.dontCaptureUserMedia = true;
}