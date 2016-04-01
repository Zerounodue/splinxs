/**
 * tourist.connection.js
 * contains functions related with the connection on the tourist side
 * used by tourists
 */

//variables
showLogs = true;

//guide channel
var channelCounter = 0;
var channels = ["myGuideChannel1"];
var channel = channels[channelCounter];

//var connection = new RTCMultiConnection();

username = "tourist1";

var saveConnInterval;
var saveConnIntervalTimer = 60000;
var localStorageConnectionName = "connection";
var localStoragePreviousConnectionTimeout = 20 * 60 * 1000;//20 min in milliseconds

/**
 * sets the channel, media and mandatory constraints
 */
setSessionConstraints();


function setSessionConstraints() {
    //connection = new RTCMultiConnection();
    //connection.socketURL = '/';
    
    if(showLogs) {
        console.log('tourist: setting session constraints');
        console.log('tourist: channel counter: ' + channelCounter);
        console.log('tourist: channel: ' + channels[channelCounter]);
    }
    
    channel = channels[channelCounter];
    
    connection.channel = channel;
    
    connection.socketCustomEvent = channels[channelCounter];
    
    //connection.socketURL = '/';

    if (typeof webkitMediaStream !== 'undefined') {
        connection.attachStreams.push(new webkitMediaStream());
    }
    else if (typeof MediaStream !== 'undefined') {
        connection.attachStreams.push(new MediaStream());
    }
    else {
        console.error('Neither Chrome nor Firefox. This may NOT work.');
    }

    //TODO only add media that is supported by the browser
    connection.session = {
        data: true
                //, audio: true
                //, video: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };
}

connection.onopen = function (event) {
    if (showLogs) console.log('tourist: connection opened');

    if (connection.alreadyOpened)
        return;
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
        return;
    }
    
    if(event.stream.type == "local"){
        if (showLogs) console.log('tourist: local stream started');
        if(event.stream.isVideo){
            if (showLogs) console.log('tourist: local video stream started');
            //TODO make nicer code
            var video = $("#myVideo");
            video.append(event.mediaElement);
            
        }else if(event.stream.isAudio){
            if (showLogs) console.log('tourist: local audio stream started');
            
            var video = $("#myVideo");
            video.append(event.mediaElement);
            
            debugger;
        }
    }else if(event.stream.type == "remote"){
        if (showLogs) console.log('tourist: remote stream started');
        if(event.stream.isAudio){
            if (showLogs) console.log('tourist: remote audio stream started');
            var audio = $("#audioDiv");
            audio.append(event.mediaElement);
            event.mediaElement.play();
            setTimeout(function () {
                event.mediaElement.play();
            }, 2000);

            
        }
        //connection.videosContainer.append(event.mediaElement);
    }
    
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
});

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
        //guide declines connection
        if(message.customMessage.guideDeclinesRequest){
            if (showLogs) console.log('tourist: guide declined request :(');
            changeToNextChannel();
            return;
        }
        //guide accepts connection
        if(message.customMessage.guideAcceptsRequest) {
            if (showLogs) console.log('tourist: guide accepted request :)');
            clearTimeout(conEstabTimeout);
            conEstabTimeout = null;
            //send message to peer if I do not support sctp
            if (supportsOnlyWebsocket()) {
                sendUseWebsocketConnection();
            }
            sendUsername(username);
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
    else if(mapMessage.updateInterval > -1){
        var interval = mapMessage.updateInterval;
        if (showLogs) console.log('tourist: update interval: ' + interval);
        setUpdateInterval(interval);
    }
}

function connectToGuides(){
    showLoadBox();
    //check if connection with previous guide was interrupted, sets first guide to call
    checkPreviousConnectionInterrupted();
    
    initConnectionWithGuide();
}
/**
 * sends the guide a request for communication
 */
function initConnectionWithGuide() {
    if(showLogs) console.log('tourist: initiating connection');
    
    setSessionConstraints();
    
    setSocketCustomEvent();
    
    //request connection with current channel (guide)
    sendTouristRequestsGuide();
    //will continue in message.customMessage.guideTouristRequestReply or timeout
    conEstabTimeout = setTimeout(function () {
        if(showLogs) console.log('tourist: connect to guide timeout');
        changeToNextChannel();
    }, conEstabTimer);
}

function establishConnectionWithGuide() {
    if (showLogs) console.log('establishing connection with guide');
    //TODO check if also possible in websocket case
    connection.join(connection.channel);
    
    //connection established, save in case connection is interrupted
    storeConnection();
    
    hideLoadBox();
    showGUI();
    showTouristUI();
}
/**
 * if the guide refused the connection or a timeout occured, try the next channel (guide)
 */
function changeToNextChannel(){
    if(showLogs) console.log('tourist: changing to next channel');
    clearTimeout(conEstabTimeout);
    conEstabTimeout = null;
    channelCounter++;
    
    if(channelCounter >= channels.length){
        if(showLogs) console.log('tourist: tried all channels without success :\'(');
        hideLoadBox();
        //TODO do something...
        return;
    }
    //channel = channels[channelCounter];
    setSessionConstraints();
    setSocketCustomEvent();  
    initConnectionWithGuide();
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
            if(diff < localStoragePreviousConnectionTimeout){
                if(showLogs) console.log('tourist: previous connection was interrupted, guide: ' + c);
                channels.splice(0, 0, c);
            }
        }
    }
}
