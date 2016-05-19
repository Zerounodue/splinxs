/**
 * tourist.ui.js
 * contains functions related with the ui on the tourist side
 * used by tourists
 */

//variables
var loadBox;
var content;

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
    setConfirmUnload(true);
    initTouristButtons();
    initChat();
}

function showTouristUI(){
    if(showLogs) console.log('tourist: show gui');
    $("btn_joinConnection").hide();
}

function showLoadBox(){
    content.hide();
    loadBox.show();
}

function hideLoadBox(){
    loadBox.hide();
    content.show();
}

function initTouristButtons(){
    /*
     $("#btn_joinConnection").click(function () {
     if(showLogs) console.log('tourist: join connection button clicked');
     connectToGuides();
     });
     */
    
    $("#btn_shareVideo").click(function (e) {
        if(showLogs) console.log('share video clicked');
        startVideo();
    });

    $("#btn_stopVideo").click(function (e) {
        if(showLogs) console.log('stop video clicked');
        //TODO mute video
        stopVideo();
    });

    $("#btn_closeConnection").click(function (e) {
        if(showLogs) console.log('btn close connection clicked');
        closeConnection();
    });

    $("#btn_muteVideo").click(function (e) {
        if(showLogs) console.log('mude video button clicked');

        connection.attachStreams.forEach(function (stream) {
            if (stream.isVideo) {
                if (showLogs)
                    console.log('muting video stream');
                stream.mute();
            }
        });

        /*
         connection.attachStreams.forEach(function (stream) {
         stream.mute();
         .mute({
         isAudio: true,
         remote: true
         });
         });
         */

    });

    $("#btn_unmuteVideo").click(function (e) {
        if(showLogs) console.log('unmuting video');

        connection.attachStreams.forEach(function (stream) {
            if (stream.isVideo) {
                if (showLogs)
                    console.log('unmuting video stream');
                stream.unmute();
            }
        });

    });

    $("#btn_startAudio").click(function (e) {
        if (showLogs) console.log('tourist: start audio button clicked');

        connection.addStream({
            audio: true
            //video: true
            //,oneway: true
        });


    });

    $("#btn_stopAudio").click(function (e) {
        if (showLogs) console.log('tourist: stop audio button clicked');
        connection.attachStreams.forEach(function (stream) {
            stream.stop();
        });

        connection.renegotiate();
    });

    function startVideo() {

        connection.addStream({
            audio: true,
            video: true
            //,oneway: true
        });

    }


    $("#btn_mute_audio").click(function (e) {
        if (showLogs) console.log('guide: mute audio button clicked '+ audioMuted);
        if(!audioMuted){
            //mute audio
            audioMuted=true;
            $('#btn_mute_audio').addClass('lightColor');
            $('#btn_mute_audio').attr('src','resources/images/icons/microphoneOff.png');
            //TODO mute
        }
        else{
            //unmute audio
            audioMuted=false;
            $('#btn_mute_audio').removeClass('lightColor');
            $('#btn_mute_audio').attr('src','resources/images/icons/microphoneOn.png');
            //TODO unmute
        }
    });

    $("#btn_mute_video").click(function (e) {
        if (showLogs) console.log('guide: mute video button clicked '+ videoMuted);
        if(!videoMuted){
            //mute video
            videoMuted =true;
            $('#btn_mute_video').addClass('lightColor');
            $('#btn_mute_video').attr('src','resources/images/icons/videoOff.png');

            connection.attachStreams.forEach(function (stream) {
                if (stream.isVideo) {
                    if (showLogs)
                        console.log('muting video stream');
                    stream.mute();
                }
            });

        }
        else{
            //unmute video
            videoMuted=false;
            $('#btn_mute_video').removeClass('lightColor');
            $('#btn_mute_video').attr('src','resources/images/icons/videoOn.png');

            connection.attachStreams.forEach(function (stream) {
                if (stream.isVideo) {
                    if (showLogs)
                        console.log('unmuting video stream');
                    stream.unmute();
                }
            });
        }
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

function setConfirmUnload(on) {
    window.onbeforeunload = (on) ? unloadMessage : null;
}

function unloadMessage() {
    return "__Are you sure you want to leave this page?";
}