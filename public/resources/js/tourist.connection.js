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
showLogs = false;

var c2P = false; //connected to peer
var channel;

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

var findGuideTimeout;
var findGuideTimeoutTimer = 60000;

var touristSocket;

var audioStream = null;

function initTouristConnection(){
    if(showLogs) console.log('init tourist connection');

    showLoadBox();
    findGuideTimeout = setTimeout(function () {
        hideLoadBox();
        $('#noMatchDialog').show();

    }, findGuideTimeoutTimer);

    //params needed to send data over websocket
    initTouristWebRTC();
    initTouristSocket();
    getGEOLocation();
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
        if(showLogs)console.log('Neither Chrome nor Firefox. This might NOT work.');
    }

    connection.dontCaptureUserMedia = true;
    connection.session = {
        data: true
        ,audio: true
        ,video: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

    //to change to back camera
    var secondVideoDeviceId = null;
    var devicesLength = 0;

    //http://www.rtcmulticonnection.org/docs/selectDevices/
    connection.DetectRTC.MediaDevices.forEach(function (device) {
        //check if 2 cameras are available
        if (device.kind.indexOf('video') !== -1) {
            devicesLength++;
            if (devicesLength == 2) {
                secondVideoDeviceId = device.id;
            }
        }
        if (secondVideoDeviceId != null) {
            //use back camera            
            connection.mediaConstraints.video.optional = [{
                sourceId: secondVideoDeviceId
            }];
        }
    });
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
            if(showLogs) console.log('0 streams...');
            return;
        }
        if(event.stream.type == "local"){
            if(audioStream == null){
                audioStream = event.stream.id;
                if (showLogs) console.log('tourist: local stream audio started');
                //this code is only because the audio contains a video
                event.mediaElement.controls = false;
                event.mediaElement.autoplay = true;
                event.mediaElement.volume = 1;
                $("#videoContainer").append(event.mediaElement);
            }else{
                if(showlogs)console.log('Video works, change code here');
            }

        }else if(event.stream.type == "remote"){
            if (showLogs) console.log('tourist: remote stream (audio) started');

            var audio = $("#audioDiv");
            audio.append(event.mediaElement);
            event.mediaElement.controls = false;
            event.mediaElement.autoplay = true;
            event.mediaElement.volume = 1;

            startAudioStream();

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
                    if(showLogs) console.log('invalid lcoation: ' + pos);
                }
            }else{
                if(showLogs) console.log('invalid marker id: ' + id + ' pos: ' + pos);
            }
        }
        if(marker.rem){
            if (showLogs) console.log('tourist: rem marker');
            var id = marker.id;
            if(id > -1){
                removeMarker(id);
            }else{
                if(showLogs) console.log('invalid id to remove marker: ' + id);
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

    if(!supportsOnlyWebsocket()){
        connection.join(connection.channel);
    }

    //connection established, save in case connection is interrupted
    storeConnection();

    hideLoadBox();
    showChatMapGUI();
    showTouristUI();
    centerAndResize();
    initToutistOrientation();

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

function initTouristSocket(){
    if(showLogs) console.log('tourist: init touristSocket');
    touristSocket = io.connect('/tourist');

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
                addWebsocketEvent();
                setSocketCustomEvent();
                initConnectionWithGuide();
            }else if(res == touristResponses.guideClosedConnection){
                if(showLogs) console.log('tourist: touristSocket guide closed connection request');
                $('#leftDialog').show();
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