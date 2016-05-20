/**
 * tourist.ui.js
 * contains functions related with the ui on the tourist side
 * used by tourists
 */

//variables
var loadBox;
var content;
var ico_audio;
var ico_video;

var audioMuted = false;
var videoMuted = false;
/**
 * initialises ui variables for tourist
 * !needs to be called in document.ready()!
 */
function initTouristUI(){
    if(showLogs) console.log('tourist: init gui');
    loadBox = $("#loadBox");
    content = $("#content");
    ico_audio = $("#ico_audio");
    ico_video = $("#ico_video");
    setConfirmUnload(true);
    initTouristButtons();
    initChat();
}

function showTouristUI(){
    if(showLogs) console.log('tourist: show gui');
    showAudioVideoIcons();
}

function showLoadBox(){
    content.hide();
    loadBox.show();
}

function hideLoadBox(){
    loadBox.hide();
    content.show();
}

function showAudioVideoIcons(){
    $("#ico_audio").show();
    $("#ico_video").show();
}

function hideAudioVideoIcons(){
    $("#ico_audio").hide();
    $("#ico_video").hide();
}

function initTouristButtons(){
    if(showLogs) console.log('tourist: init tourist buttons');

    $("#btn_closeConnection").click(function (e) {
        if(showLogs) console.log('btn close connection clicked');
        closeConnection();
    });

    $("#ico_audio").click(function (e) {
        if (showLogs) console.log('tourist: audio icon clicked, will mute: ' + !audioMuted);
        if(audioMuted){
            //unmute audio
            ico_audio.removeClass('lightColor');
            ico_audio.attr('src','resources/images/icons/microphoneOn.png');
            unmuteAudio();
        }else{
            //mute audio
            ico_audio.addClass('lightColor');
            ico_audio.attr('src','resources/images/icons/microphoneOff.png');
            muteAudio();
        }
        audioMuted = !audioMuted;
    });

    $("#ico_video").click(function (e) {
        if (showLogs) console.log('tourist: video icon clicked, will mute: ' + !videoMuted);
        if(videoMuted){
            //unmute video
            ico_video.removeClass('lightColor');
            ico_video.attr('src','resources/images/icons/videoOn.png');
            unmuteVideo();
        }else{
            //mute video
            ico_video.addClass('lightColor');
            ico_video.attr('src','resources/images/icons/videoOff.png');
            muteVideo();
        }
        videoMuted = !videoMuted;
    });


    $("#touristControlsBtn").on('click', function(e){
        if(showLogs) console.log('guideControlsBtn  button clicked');
        $('.navbar-collapse').collapse('hide');
        $("#touristControls").show(animDur);
    });


    $("#btn_touristClose").on('click', function(e){
        if(showLogs) console.log('guide close button clicked');

        $("#touristControls").hide(animDur);
    });
}

function muteAudio(){
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.isAudio) {
                if (showLogs) console.log('tourist: muting audio stream');
                stream.mute();
            }
        }
    });
}

function unmuteAudio(){
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.isAudio) {
                if (showLogs) console.log('tourist: unmuting audio stream');
                stream.unmute();
            }
        }
    });
}

function muteVideo() {
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.isVideo) {
                if (showLogs) console.log('tourist: muting video stream');
                stream.mute();
            }
        }
    });
}

function unmuteVideo(){
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.isVideo) {
                if (showLogs) console.log('tourist: unmuting video stream');
                stream.unmute();
            }
        }
    });
}

function setConfirmUnload(on) {
    window.onbeforeunload = (on) ? unloadMessage : null;
}

function unloadMessage() {
    return "__Are you sure you want to leave this page?";
}