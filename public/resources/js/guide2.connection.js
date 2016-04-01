/**
 * guide.connection.js
 * contains functions related with the connection on the guide side
 * used by guides
 */

//variables
showLogs = true;

//var connection = new RTCMultiConnection();

//guide channel
var channel = "myGuideChannel2";
connection.channel = channel;

connection.socketCustomEvent = connection.channel;

username = "guide2";

connection.session = {
    data: true
            //, audio: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

connection.open(channel);


connection.onopen = function (event) {
    if (showLogs) console.log('guide: connection opened');

    if (connection.alreadyOpened)
        return;
    connection.alreadyOpened = true;

};


connection.onmessage = function (message) {
    if (showLogs) console.log('guide: sctp message arrived');
    if (!message.data) {
        if (showLogs) console.log('guide: empty sctp message');
        return;
    }
    onMessage(message.data);
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
        //a tourist requests to communicate with me
        if(message.customMessage.touristRequestsGuide){
            if (showLogs) console.log('guide: tourist asked for help');
            //show prompt if I want to help the tourist
            showTouristRequestsGuidePrompt();
            //hide prompt after timeout (tourist will try to connect to new guide)
            //=> I mustn't see the prompt anymore
            conEstabTimeout = setTimeout(function () {
                if(showLogs) console.log('tourist: tourist request timeout');
                hideTouristRequestGuidePrompt();
            }, conEstabTimer);
            
            return;
        }
        //tourist revoked the connection request (or timeout)
        if(message.customMessage.touristRevokesRequest){
            if (showLogs) console.log('guide: tourist revoked request');
            hideTouristRequestGuidePrompt();
            return;
        }
        onMessage(message.customMessage);
    });
});
/**
 * checks what kind of message arrived acts accordingly
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
        showGUI();
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
            var pos = message.map.tourist.pos;
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
                    addMarker(id, pos);
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
    sendGuideAcceptsRequest();
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

