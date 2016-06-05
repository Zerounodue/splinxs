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
 * util.js
 * contains functions useful for the application's daily business
 * used by guides and tourists
 */

//variables
var audioPlayer;
var sounds;
var vibrations;
var isTypingTimeout = null;
var typingTimeout = 2000;


/**
 * initialises the used variables
 * !needs to be called in document.ready()!
 */
function initSplinxs() {
    audioPlayer = $("#audioPlayer").get(0);

    sounds = {
        call_ring: "resources/sounds/call/den_den_mushi_1.mp3",
        call_answer: "resources/sounds/call/den_den_mushi_gacha_1.mp3",
        call_dial: "",
        message_arrival: "resources/sounds/message/arrival.mp3"
    };
    
    vibrations = {
        stop: 0,
        message: 1,
        connectionRequest: 2
    };
    
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

}

/*
 function sendCustomMessage(message){
 message.userid = connection.userid;
 message.extra = connection.extra;
 connection.sendCustomMessage(message);
 }
 */



/**
 * gets the current time in the format HH:MM:SS
 * @returns {String} returns the current time in the format HH:MM:SS
 */
function getCurrentTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    var currentTime = hours + ":" + minutes + ":" + seconds;

    return currentTime;
}
/**
 * gets the current time as unix timestamp in milliseconds
 * @returns {Number} the current time as unix timestamp
 */
function getCurrentTimeMillis(){
    var currTime = new Date().getTime();
    return currTime;
}
/**
 * plays a sound or does nothing if the specified sound does not exist
 * @param {sounds} sound sound that should be played
 */
function playSound(sound) {
    console.log('play sound: ' + sound);

    switch (sound) {
        case sounds.call_answer:
            audioPlayer.src = sounds.call_answer;
            break;
        case sounds.call_ring:
            audioPlayer.src = sounds.call_ring;
            break;
        case sounds.message_arrival:
            audioPlayer.src = sounds.message_arrival;
            break;
        default:
            audioPlayer.src = "";
            break;

    }

    if (audioPlayer.src != "") {
        console.log('playing sound');
        audioPlayer.play();
    }
}

/**
 * stops the sound that might be playing
 */
function stopSound() {
    audioPlayer.pause();
}
/**
 * causes the device to vibrate (if supported by the device)
 * uses a predefined patternint
 * @param {int} vibration which vibration pattern to use
 */
function vibrate(vibration) {
    if (navigator.vibrate) {
        switch(vibration){
            case vibrations.stop:
                navigator.vibrate([0]);
                break;
            case vibrations.message:
                navigator.vibrate([75, 100, 100]); // intervall, pause, intervall, pause...
                break;
            case vibrations.connectionRequest:
                navigator.vibrate([
                    300, 200, 300, 200, 300, 200, 300, 200, 300, 200,//2500ms
                    300, 200, 300, 200, 300, 200, 300, 200, 300, 200, 
                    300, 200, 300, 200, 300, 200, 300, 200, 300, 200, 
                    300, 200, 300, 200, 300, 200, 300, 200, 300, 200]);
                break;
            default:
                
                break;
        }
    }
}

function stopVibration(){
    vibrate(vibrations.stop);
}


/**
 * sends a message to the peer that I am typing
 */
function meIsTyping() {
    console.log('me is typing');
    //will send the typing message only if it is already expired => saves data
    if (isTypingTimeout == null) {
        sendMessageToPeer({
            typing: true
        }, false);
    }
    clearTimeout(isTypingTimeout);
    isTypingTimeout = setTimeout(meStoppedTyping, typingTimeout);
}
/**
 * sends a message to the peer that I stopped typing
 */
function meStoppedTyping() {
    console.log('me stopped typing');
    isTypingTimeout = null;
    sendMessageToPeer({
        stoppedTyping: true
    }, false);
}
/**
 * saves data to the localstorage with a given key
 * @param {string} key to save data with
 * @param {object} data to save
 */
function saveToLocalStorage(key, data){
    if(showLogs) console.log('saving to localstorage, key: ' + key + ' data: ' + data); 
    localStorage.setItem(key,JSON.stringify(data));
}
/**
 * gets an object stored in localstorage or null
 * @param {string} key item to get from localstorage
 * @returns {Object} the object from localstorage or null
 */
function getFromLocalStorage(key){
    if(showLogs) console.log('getting from localstorage, key: ' + key);
    var data = JSON.parse(localStorage.getItem(key));
    return data;
}
/**
 * delets all items from localstorage (if localStorage is supported by the device)
 */
function clearLocalStorage(){
    if(typeof(Storage) !== "undefined") {
        localStorage.clear();
    }
}

function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    var ret = textArea.innerHTML;
    textArea.remove();
    return ret;
}
