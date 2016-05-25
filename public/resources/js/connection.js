/**
 * connection.js
 * contains function related with the connection between guide and tourist
 * used by guides and tourists
 */

//variables
var showLogs = true;

var connectionState = {
    DataChannel: {},
    Media: {}
};
var connectionStates = {
    DataChannel: {
        Websocket: "Websocket",
        SCTP: "SCTP"
    },
    Media: {
        None: "None",
        Audio: "Audio",
        Video: "Video",
        AudioVideo: "AudioVideo"
    }
};

var websocket;
//timeout for connection request variable
var conEstabTimeout = null; 
//timeout for connection request
var conEstabTimer = 10000; //milliseconds

var username;
var peername;

/**
 * fires once the detect rtc script is ready
 */
/*
DetectRTC.load(function () {

    if(showLogs) console.log('DetectRTC load');
    detectRTCcapabilities();
});
*/

var connection;

/**
 * checks the browser's capabilities and sets the connection state accordingly
 */
function detectRTCcapabilities(){
    
    if (!DetectRTC.browser.isChrome && !DetectRTC.browser.isFirefox && !DetectRTC.browser.isOpera) {
        if (showLogs) console.log('not chrome, firefox or opera, webrtc is not supported...');
        connectionState.DataChannel = connectionStates.DataChannel.Websocket;
        connectionState.Media = connectionStates.Media.None;
    }else if(DetectRTC.browser.isChrome || DetectRTC.browser.isFirefox || DetectRTC.browser.isOpera){
        connectionState.DataChannel = connectionStates.DataChannel.SCTP;
        if(DetectRTC.hasMicrophone && DetectRTC.hasWebcam){
            connectionState.Media = connectionStates.Media.AudioVideo;
        }else{
            //debugger;
            if(DetectRTC.hasMicrophone){
                connectionState.Media = connectionStates.Media.Audio;
            }else if(DetectRTC.hasWebcam){
                connectionState.Media = connectionStates.Media.Video;
            }
            else{
                if (showLogs){console.warn("DetectRTC failed or no Microphone & Webcam installed");}
                connectionState.Media = connectionStates.Media.None;
            }
        }
    }
}

/**
 * sends a message to the peer using either SCTP or Websocket
 * if the message contains characters
 * appends it to the chat, if desired
 * @param {String} message message to send to the peer
 * @param {boolean} appendChat true if message should be appended to the chat
 */
function sendMessageToPeer(message, appendChat) {    
    if ($.trim(message).length > 0) {
        if (connectionState.DataChannel == connectionStates.DataChannel.SCTP) {
            sendMessageSCTP(message);
        } else if (connectionState.DataChannel == connectionStates.DataChannel.Websocket) {
            sendMessageWebsocket(message);
        }
        if (appendChat) {
            appendMyMessageToChat(message);
        }
    }
}
/**
 * sends a message to the peer by using SCTP
 * @param {String} message message to send
 */
function sendMessageSCTP(message) {
    if(showLogs) console.log('sending SCTP message, channel: ' + connection.channel);
    connection.send(message);
}
/**
 * sends a message to the peer by using a websocket
 * @param {String} message message to send
 */
function sendMessageWebsocket(message) {
    if(showLogs) console.log("sending: message using websocket custom event: " + connection.socketCustomEvent);
    
    websocket.emit(connection.socketCustomEvent, {
        sender: connection.userid,
        customMessage: message
    });
}
/**
 * sends a message to the peer that this connection should only use websockets
 * by using websocket
 */
function sendUseWebsocketConnection() {
    if (showLogs) console.log('sending: only websocket supported');
    sendMessageWebsocket({
        connection: connectionStates.DataChannel.Websocket
    });
}
/**
 * sends my username to the peer by using websocket
 * @param {String} name my username
 */
function sendUsername(name) {
    if (name) {
        sendMessageWebsocket({
            username: name
        }, false);
    }
}
/**
 * tourist requests to communicate with guide
 */
function sendTouristRequestsGuide(){
    if (showLogs) console.log('sending: tourist requests guide');
    sendMessageWebsocket({
        touristRequestsGuide: true
    });
}
/**
 * guide accepts tourist's request
 */
function sendGuideAcceptsRequest(){
    if (showLogs) console.log('sending: guide accepts request');
    sendMessageWebsocket({
        guideAcceptsRequest: true
    });
}
/**
 * guide declines tourist's request
 */
function sendGuideDeclinesRequest(){
    if (showLogs) console.log('sending: guide declines request');
    sendMessageWebsocket({
        guideDeclinesRequest: true
    });
}

function sendTouristRevokesRequest(){
    if (showLogs) console.log('sending: tourist revokes request');
    sendMessageWebsocket({
        touristRevokesRequest: true
    });
}

function sendCloseConnection(){
    if(showLogs) console.log('sending: close connection');
    sendMessageWebsocket({
        closeConnection: true
    });
}

function sendMapData(data){
    //cannot send to peer if not connected
    if(!c2P) return;
    if(showLogs) console.log('sending: mapdata');
    sendMessageToPeer({map: data}, false);
}
/**
 * when a message arrived from SCTP or Websocket this function has to be called
 * plays a sound, appends the message to the chat, vibrates
 * @param {String} message message sent by the peer
 */
function messageArrived(message) {
    if (showLogs) console.log('messageArrived: ' + message);
    //play message sound
    playSound(sounds.message_arrival);
    appendPeerMessageToChat(message, peername);
    vibrate();
}
/**
 * checks if only websocket is supported
 * @returns {Boolean} true if connection supports only websocket
 */
function supportsOnlyWebsocket(){
    return connectionState.DataChannel == connectionStates.DataChannel.Websocket;
}
/**
 * checks if media is supported
 * @returns {Boolean} true if no media is supported
 */
function noMediaSupported(){
    return connectionState.Media == connectionStates.Media.None;
}
/**
 * checks if only audio is supported
 * @returns {Boolean} true if no media is supported
 */
function supportsAudioOnly(){
    return connectionState.Media == connectionStates.Media.Audio;
}
/**
 * checks if only video is supported
 * @returns {Boolean} true if no media is supported
 */
function supportsVideoOnly(){
    return connectionState.Media == connectionStates.Media.Video;
}
/**
 * checks if audio and video is supported
 * @returns {Boolean} true if no media is supported
 */
function supportsAudioVideo(){
    return connectionState.Media == connectionStates.Media.AudioVideo;
}
/**
 * closes the current connection
 */
/*
function closeConnection() {
    connection.close();
    
    connection.attachStreams.forEach(function (stream) {
        stream.stop();
    });
    
}
*/
/**
 * closes all media streams
 * !does not affect sctp/websocket text chat!
 */
function stopStreams() {
    connection.attachStreams.forEach(function (stream) {
        stream.stop();
    });
}

//TODO delete?
function stopVideo() {
    //removes all media streams
    connection.attachStreams.forEach(function (stream) {
        stream.stop();
    });
    connection.renegotiate();

}