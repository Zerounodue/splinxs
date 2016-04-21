/**
 * guide.connection.js
 * contains functions related with the connection on the guide side
 * used by guides
 */

//variables
showLogs = true;

//var connection = new RTCMultiConnection();

var guideSocket;
var guideStates = {
    state: "state",
    available: 1,
    unavailable: 2
};
var guideRequests = {
    help: 1,
    cancel: 2,
    tooLate: 3
};

var guideResponses = {
    response: "response",
    accept: 1
};

var ongoingConnectionInterval;
var ongoingConnectionIntervalTimer = 60 * 1000; //60 seconds

//guide channel
var channel;// = "myGuideChannel1";



function initGuideConnection(){

    if(showLogs) console.log('init guide connection');
    
    username = "guide1";
    
    channel = username;

    initGuideWebRTC();
    
    initGuideSocket();
}

function initGuideWebRTC(){
    connection = new RTCMultiConnection();
    connection.socketURL = '/';


    connection.channel = channel;

    connection.socketCustomEvent = connection.channel;
    /*
    if (typeof webkitMediaStream !== 'undefined') {
        connection.attachStreams.push(new webkitMediaStream());
    }
    else if (typeof MediaStream !== 'undefined') {
        connection.attachStreams.push(new MediaStream());
    }
    else {
        console.error('Neither Chrome nor Firefox. This demo may NOT work.');
    }
    */

    //connection.dontCaptureUserMedia = true;

    connection.session = {
        data: true
        ,audio: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

    connection.open(connection.channel);


    connection.onopen = function (event) {
        if (showLogs) console.log('guide: connection opened in channel: ' + connection.channel);

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

    connection.onstream = function (event) {
        if (showLogs) console.log('guide: stream started');
        if (!event.stream.getAudioTracks().length && !event.stream.getVideoTracks().length) {
            return;
        }

        if(event.stream.type == "local"){
            if (showLogs) console.log('guide: local stream started');
            if(event.stream.isAudio){
                if (showLogs) console.log('guide: local audio stream started');
                /*
                connection.videosContainer.append(event.mediaElement);
                event.mediaElement.play();
                setTimeout(function () {
                    event.mediaElement.play();
                }, 2000);
                */
            }

        }else if(event.stream.type == "remote"){
            if (showLogs) console.log('guide: remote stream started');
            if(event.stream.isVideo){
                if (showLogs) console.log('guide: remote video stream started');
                connection.videosContainer.append(event.mediaElement);
            }else if(event.stream.isAudio){
                if (showLogs) console.log('guide: remote audio stream started');
                var audio = $("#audioDiv");
                audio.append(event.mediaElement);
                
                /*
                event.mediaElement.play();
                setTimeout(function () {
                    event.mediaElement.play();
                }, 2000);
                */
            }
        }

    };
    /*
    connection.onstreamended = function (event) {
        console.log('stream ended');
        $("#videoContainer").empty();

        event.mediaElement.remove();


        connection.attachStreams.forEach(function (stream) {
            stream.stop();
        });

    }
    */

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
            /*
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
            */
            /*
            //tourist revoked the connection request (or timeout)
            if(message.customMessage.touristRevokesRequest){
                if (showLogs) console.log('guide: tourist revoked request');
                hideTouristRequestGuidePrompt();
                return;
            }
            */
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
        showGUI();
        informServerOngoingConnection();
        //set param on db that guide is connected to tourist
        ongoingConnectionInterval = setInterval(function () {
            informServerOngoingConnection();
        }, ongoingConnectionIntervalTimer);

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
    //guideSocket = io.connect('https://localhost/guide');
    guideSocket = io.connect('https://splinxs.ti.bfh.ch/guide');
    
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