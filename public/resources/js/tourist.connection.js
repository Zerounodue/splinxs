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
 * tourist.connection.js
 * contains functions related with the connection on the tourist side
 * used by tourists
 */

//variables
showLogs = true;

var c2P = false; //connected to peer

var channel;

//var connection = new RTCMultiConnection();

var touristRequests = {
    request: "request",
    help: 1
};

var touristResponses = {
    response: "response",
    accepted: 1,
    guideClosedConnection: 2
};

var saveConnInterval;
var saveConnIntervalTimer = 60000;
var localStorageConnectionName = "connection";
var localStoragePreviousConnectionTimeout = 20 * 60 * 1000;//20 min in milliseconds

var findGuideTimeout;
var findGuideTimeoutTimer = 60000;

var touristSocket;

var audioStream = null;

function initTouristConnection(){
    if(showLogs) console.log('init tourist connection');

    showLoadBox();
    
    findGuideTimeout = setTimeout(function () {
        hideLoadBox();
        //alert('__sorry, no matching guide could be found...');
        $('#noMatchDialog').show();
        //connectionClosed is performed when pressing on the ok button
        //connectionClosed();

    }, findGuideTimeoutTimer);

    //params needed to send data over websocket
    
    
    //if(!supportsOnlyWebsocket()){
        initTouristWebRTC();
    //}
    
    //connection.videosContainer = $("#videoContainer");
    
    initTouristSocket();
}

function initTouristWebRTC(){
    if (showLogs) console.log('tourist: set session constraints');
    connection = new RTCMultiConnection();
    connection.socketURL = '/';

    if (typeof webkitMediaStream !== 'undefined') {
        connection.attachStreams.push(new webkitMediaStream());
    } else if (typeof MediaStream !== 'undefined') {
        connection.attachStreams.push(new MediaStream());
    } else {
        //console.warn('Neither Chrome nor Firefox. This might NOT work.');
    }
    
    connection.dontCaptureUserMedia = true;
    
    //TODO check if this works
    connection.session = {
        data: true
        ,audio: true
        //audio: 'two-way',
        ,video: true
        //oneway: true
        //data: true
        //,audio: true//DetectRTC.hasMicrophone
        //,video: true//DetectRTC.hasWebcam
    };
    
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true//DetectRTC.hasWebcam
    };
    
    initTouristWebRTCEvents();
}

function initTouristWebRTCEvents(){
    connection.onopen = function (event) {
        if (showLogs) console.log('tourist: connection opened');

        if (connection.alreadyOpened) return;
        connection.alreadyOpened = true;
    };

    connection.onmessage = function (message) {
        if (showLogs) console.log('tourist: sctp message arrived');
        if (!message.data) {
            if (showLogs) console.log('tourist: empty sctp message');
            return;
        }
        onMessage(message.data);
    };

    connection.onstream = function (event) {
        if (showLogs) console.log('tourist: stream started');
        if (!event.stream.getAudioTracks().length && !event.stream.getVideoTracks().length) {
            if(showLogs) console.warn('0 streams...');
            return;
        }
        
        if(event.stream.type == "local"){


            if(audioStream == null){
                audioStream = event.stream.id;
                if (showLogs) console.warn('tourist: local stream audio started');


                //this code is only because the audio contains a video
                event.mediaElement.controls = false;
                event.mediaElement.autoplay = true;
                event.mediaElement.volume = 1;

                //TODO make nicer code
                var video = $("#videoContainer");
                video.append(event.mediaElement);



            }else{
                console.error('Video works, change code here');
                return;


                if (showLogs) console.warn('tourist: local stream video started');
                event.mediaElement.controls = true;
                event.mediaElement.autoplay = true;
                event.mediaElement.volume = 1;

                //TODO make nicer code
                var video = $("#videoContainer");
                video.append(event.mediaElement);
                showVideo();
            }



            
            

            /*
            if(event.stream.isVideo){
                if (showLogs) console.log('tourist: local video stream started');
                //TODO do other things?
                event.mediaElement.controls=false;
                event.mediaElement.autoplay=true;

                //TODO make nicer code
                var video = $("#videoContainer");
                video.append(event.mediaElement);
                showVideo();
                
                //TODO make in ui script
                video.show();
                $("#hammerVideo").show();
                
                //connection.videosContainer.append(event.mediaElement);
            }else if(event.stream.isAudio){
                if (showLogs) console.log('tourist: local audio stream started');
                //might never happen...
            }
            */
        }else if(event.stream.type == "remote"){
            if (showLogs) console.warn('tourist: remote stream (audio) started');
            /*
            if(event.stream.isAudio){
                if (showLogs) console.log('tourist: remote audio stream started');
                var audio = $("#audioDiv");
                audio.append(event.mediaElement);
                //TODO check if this actually does something
                event.mediaElement.play();
                setTimeout(function () {
                    event.mediaElement.play();
                }, 2000);
            }
            */
            
            //if (showLogs) console.log('tourist: remote audio stream started');
            var audio = $("#audioDiv");
            audio.append(event.mediaElement);
            event.mediaElement.controls = true;
            event.mediaElement.autoplay = true;
            event.mediaElement.volume = 1;
            //TODO check if this actually does something
            /*
            event.mediaElement.play();
            setTimeout(function () {
                event.mediaElement.play();
            }, 2000);
            */
            //connection.dontCaptureUserMedia = false;
            startAudioStream();
            //startVideoStream();
        }

    };
    
    connection.onmute = function (event) {
        event.mediaElement.pause();
    };

    connection.onunmute = function (event) {
        event.mediaElement.play();
    };
    
    /**
     * fires when the signalling websocket was connected successfully
     * this socket will be used as a fall back if SCTP is not available
     * @param {Websocket} socket Websocket used for signalling and sending other messages
     */
    connection.connectSocket(function (socket) {
        if (showLogs) console.log('tourist: websocket connected');
        websocket = socket;
        //setSocketCustomEvent();
        //connection;
        
        //TODO call guide
        //establishConnectionWithGuide();
        
        //initConnectionWithGuide();
        
    
        //channel = 'guide1';
        //connection.socketCustomEvent = channel;
        
        //setSocketCustomEvent();
        
        //to make sure everything is ready
    });
}

function setSocketCustomEvent(){
    if(showLogs) console.log('tourist: setting custom event: ' + connection.socketCustomEvent);
    // listen custom messages from server
    websocket.on(connection.socketCustomEvent, function (message) {
        if (showLogs) console.log('tourist: websocket message arrived');
        if (!message.customMessage) {
            if (showLogs) console.log('tourist: empty websocket message');
            return;
        }
        //message that peer only supports websockets => I will use only websockets too
        if(message.customMessage.connection){
            if (showLogs) console.log('tourist: peer only supports websockets, will do the same');
            connectionState.DataChannel = connectionStates.DataChannel.Websocket;
            return;
        }
        onMessage(message.customMessage);
    });
}
/**
 * checks what kind of message arrived acts accordingly
 * @param {String} message message sent by peer
 */
function onMessage(message) {
    if (message.map){
        if (showLogs) console.log('tourist: map message');
        mapMessage(message.map);
        return;
    }
    if (message.typing) {
        if (showLogs) console.log('tourist: peer typing');
        peerIsTyping(peername);
        return;
    }
    if (message.stoppedTyping) {
        if (showLogs) console.log('tourist: peer stopped typing');
        peerStoppedTyping();
        return;
    }
    if (message.username) {
        if (showLogs) console.log('tourist: peername: ' + message.username);

        peername = message.username;

        establishConnectionWithGuide();
        return;
    }
    //tourist closed the connection
    if (message.closeConnection) {
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
    if (mapMessage.marker) {
        var marker = mapMessage.marker;
        if (showLogs) console.log('tourist: map marker');
        if(marker.add){
            if (showLogs) console.log('tourist: add marker');
            var id = marker.id;
            var pos = marker.pos;
            if(id  > -1 && pos){
                if(pos.lat && pos.lng){
                    addGuidesMarker(id, pos);
                }else{
                    if(showLogs) console.warn('invalid lcoation: ' + pos);
                }
            }else{
                if(showLogs) console.warn('invalid marker id: ' + id + ' pos: ' + pos);
            }
        }
        if(marker.rem){
            if (showLogs) console.log('tourist: rem marker');
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
 * sends the guide a request for communication
 */
function initConnectionWithGuide() {
    if(showLogs) console.log('tourist: initiating connection');
    
    //send message to peer if I do not support sctp
    if (supportsOnlyWebsocket()) {
        sendUseWebsocketConnection();
    }
    sendUsername(username);
    sendFirstPosition(touristPos);
}

function establishConnectionWithGuide() {
    if (showLogs) console.log('establishing connection with guide');

    clearTimeout(findGuideTimeout);
    c2P = true;

    //TODO verify if this works
    if(!supportsOnlyWebsocket()){
        connection.join(connection.channel);
    }

    //connection established, save in case connection is interrupted
    storeConnection();
    
    hideLoadBox();
    showChatMapGUI();
    showTouristUI();
    //map is gray when it is not resized
    resizeMap();
    //get current location and send to guide
    getGEOLocation();



}
/**
 * stores channel name and current minute to localstorage every 60 seconds (if supported)
 */
function storeConnection(){
    if(typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        if(showLogs) console.log('tourist: localstorage supported');
        saveConnection();
        saveConnInterval = setInterval(function () {
            saveConnection();
        }, saveConnIntervalTimer);
    } else {
        if(showLogs) console.log('tourist: localstorage not supported...');
        //TODO use cookies?
    }
}
/**
 * saves channel name and current minute to localstorage
 */
function saveConnection(){
    if(showLogs) console.log('saving connection');
    var data = {channel: connection.channel, time: getCurrentTimeMillis()};
    saveToLocalStorage(localStorageConnectionName, data);
}
/**
 * checks if a previous connection with a guide has been interrupted
 * adds this connection to the first of the list
 */
function checkPreviousConnectionInterrupted(){
    var data = getFromLocalStorage(localStorageConnectionName);
    if(data != null){
        var c = data.channel;
        var t = data.time;
        if(t > 0 && c != ""){
            var currTime = getCurrentTimeMillis();
            var diff = currTime - t;
            /* //TODO redo
            if(diff < localStoragePreviousConnectionTimeout){
                if(showLogs) console.log('tourist: previous connection was interrupted, guide: ' + c);
                //channels.splice(0, 0, c);
            }
            */
        }
    }
}

function initTouristSocket(){
    if(showLogs) console.log('tourist: init touristSocket');
    touristSocket = io.connect('https://splinxs.ti.bfh.ch/tourist');
    //touristSocket = io.connect('https://localhost/tourist');
    
    initEvents();
}

function initEvents(){
    if(showLogs) console.log('tourist: init touristSocket evetns');
    
    touristSocket.on('connect', function(){
        if(showLogs) console.log('tourist: touristSocket connect');
        touristSocketSendRequest(touristRequests.help);
    });
    
    touristSocket.on(username, function(msg){
        if(showLogs) console.log('tourist: touristSocket message on: ' + username);
        if(!msg){
            if(showLogs) console.log('tourist: touristSocket invalid message');
            return;
        }
        if(msg.response){
            var res = msg.response;
            var guide = msg.guide;
            if(res == touristResponses.accepted){
                if(!guide){
                    if(showLogs) console.log('tourist: touristSocket guide accepted but no name received...');
                    return;
                }
                if(showLogs) console.log('tourist: touristSocket accepted response, guide: ' + guide);

                channel = guide;
                connection.channel = channel;
                connection.socketCustomEvent = channel;
                //initTouristWebRTC();
                addWebsocketEvent();
                setSocketCustomEvent();
                initConnectionWithGuide();
            }else if(res == touristResponses.guideClosedConnection){
                if(showLogs) console.log('tourist: touristSocket guide closed connection request');
                $('#leftDialog').show();
                //alert('__Guide left connection in a mean way...');
                //connectionClosed is performed when pressing on the ok button
                //connectionClosed();
            }
        }
    });
    
}

function touristSocketSendRequest(r){
    touristSocketSendMessage(touristRequests.request, {request: r, name: username});
}

function touristSocketSendMessage(topic, msg){
    if(showLogs) console.log('tourist: touristSocket send on: ' + topic + ', message: ' + msg);
    touristSocket.emit(topic, msg);
}

function addWebsocketEvent(){
    websocket.emit("addEvent", {event: connection.socketCustomEvent});
}

function closeConnection(){
    if (showLogs) console.log('tourist: closing connection');
    sendCloseConnection();
    connectionClosed();
}

function connectionClosed(){
    if (showLogs) console.log('tourist: connection closed by guide');
    //TODO do nicer
    setConfirmUnload(false);
    window.location = "/";
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

function startVideoStream(){
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
        audio: true,
        video: true
        //,oneway: true
    });

}

function stopVideoStream(){
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
    }

    connection.renegotiate();
    
    
}