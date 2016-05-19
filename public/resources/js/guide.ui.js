/**
 * guide.ui.js
 * contains functions related with the ui on the guide side
 * used by guides
 */
var modalDialog;
var modalContent;
var mapControls;
var showLogs=true;

var audioMuted = false;
var videoMuted = false;


/**
 * initialises ui variables for guide
 * !needs to be called in document.ready()!
 */
function initGuideUI(){
    if(showLogs) console.log('guide: init gui');
    modalDialog = $("#modalDialog");
    modalContent = $("#modalContent");
    mapControls = $("#mapControls");

    //set the confirmUnload to false, if the guide clicks on this links he knows he will leave the page
    $("#a_logout").click(function (e) {
        if(showLogs) console.log('logout a clicked');
        setConfirmUnload(c2P);
    });
    $("#a_guideLanguages").click(function (e) {
        if(showLogs) console.log('guideLanguages a clicked');
        setConfirmUnload(c2P);
    });
    $("#a_guideAreas").click(function (e) {
        if(showLogs) console.log('guideAreas a clicked');
        setConfirmUnload(c2P);
    });
    $("#a_guidePassword").click(function (e) {
        if(showLogs) console.log('guidePassword a clicked');
        setConfirmUnload(c2P);
    });

    $("#btn_available").click(function (e) {
        if(showLogs) console.log('btn available clicked');
        setAvailable();
    });

    $("#btn_unavailable").click(function (e) {
        if(showLogs) console.log('btn unavailable clicked');
        setUnavailable();
    });

    setConfirmUnload(true);

    initGuideButtons();
    initChat();


    $("#guideControlsBtn").on('click', function(e){
        if(showLogs) console.log('guideControlsBtn  button clicked');
        $('.navbar-collapse').collapse('hide');
        $("#guideControls").show(animDur);
    });


    $("#btn_guideClose").on('click', function(e){
        if(showLogs) console.log('guide close button clicked');

        $("#guideControls").hide(animDur);
    });
}

function setAvailable(){
    guideSocketSendState(guideStates.available);
    $("#spn_state").text("__available");
}
function setUnavailable(){
    guideSocketSendState(guideStates.unavailable);
    $("#spn_state").text("__unavailable");
}

//TODO remove this unused function
function showGuideUI(){
    if(showLogs) console.log('guide: show gui');
    mapControls.show();
}

function showModalDialog(content) {
    modalContent.text(content);
    modalDialog.show();
}

function hideModalDialog(){
    modalDialog.hide();
}

function showTouristRequestsGuidePrompt(){
    console.log('torist in need of help!!!');
    //display sound
    playSound(sounds.call_ring);
    //vibrate
    vibrate(vibrations.connectionRequest);
    
    var content = "A guide needs your help! Will you help?";
    showModalDialog(content);
}

function hideTouristRequestGuidePrompt(){
    hideModalDialog();
    stopSound();
    stopVibration();
}
/**
 * initiates all buttons used by the guide
 */
function initGuideButtons() {

    $("#modalYes").click(function () {
        if (showLogs) console.log('guide: modalYes button clicked');
        //send accepted to tourist
        guideAcceptsRequest();
        hideTouristRequestGuidePrompt();
        playSound(sounds.call_answer);
    });

    $("#modalNo").click(function () {
        if (showLogs) console.log('guide: modalNo button clicked');
        //send declined to tourist
        guideDeclinesRequest();
        hideTouristRequestGuidePrompt();
    });

    $("#btn_stopVideo").click(function (e) {
        if (showLogs) console.log('stop video clicked');
        //TODO mute video
        stopVideo();
    });

    //closes the tourist's connection, the guide stays connected
    $("#btn_closeConnection").click(function (e) {
        if (showLogs) console.log('closing connection');
        closeConnection();
    });
    /*
    //---map controls to set update interval of tourist---
    $("#btn_updateIntervalOff").click(function (e) {
        if (showLogs) console.log('update interval off button clicked');
        sendUpdateInterval(updateIntervals.off);
    });

    $("#btn_updateIntervalBatman").click(function (e) {
        if (showLogs) console.log('update interval batman button clicked');
        sendUpdateInterval(updateIntervals.batman);
    });

    $("#btn_updateIntervalSpiderman").click(function (e) {
        if (showLogs) console.log('update interval spiderman button clicked');
        sendUpdateInterval(updateIntervals.spiderman);
    });

    $("#btn_updateIntervalIronman").click(function (e) {
        if (showLogs) console.log('update interval ironman button clicked');
        sendUpdateInterval(updateIntervals.ironman);
    });

    $("#btn_updateIntervalSuperman").click(function (e) {
        if (showLogs) console.log('update interval superman button clicked');
        sendUpdateInterval(updateIntervals.superman);
    });

    $("#btn_updateIntervalFlash").click(function (e) {
        if (showLogs) console.log('update interval flash button clicked');
        sendUpdateInterval(updateIntervals.flash);
    });
    */

    $("#btn_startAudio").click(function (e) {
        if (showLogs) console.log('guide: start audio button clicked');
        //connection.dontCaptureUserMedia = false;
        connection.addStream({
            audio: true
            //video: true
            //,oneway: true
        });
    });

    $("#btn_stopAudio").click(function (e) {
        if (showLogs) console.log('guide: stop audio button clicked');
        connection.attachStreams.forEach(function (stream) {
            stream.stop();
        });
        connection.renegotiate();
    });


    $("#btn_mute_audio").click(function (e) {
        if (showLogs) console.log('guide: mute audio button clicked '+ audioMuted);
        if(!audioMuted){
            //mute audio
            audioMuted=true;
            $('#btn_mute_audio').addClass('lightColor');
            $('#btn_mute_audio').attr('src','../resources/images/icons/microphoneOff.png');
            //TODO mute
        }
        else{
            //unmute audio
            audioMuted=false;
            $('#btn_mute_audio').removeClass('lightColor');
            $('#btn_mute_audio').attr('src','../resources/images/icons/microphoneOn.png');
            //TODO unmute
        }
    });

    $("#btn_mute_video").click(function (e) {
        if (showLogs) console.log('guide: mute video button clicked '+ videoMuted);
        if(!videoMuted){
            //start video
            videoMuted =true;
            $('#btn_mute_video').addClass('lightColor');
            $('#btn_mute_video').attr('src','../resources/images/icons/videoOff.png');

        }
        else{
            //stop video
            videoMuted=false;
            $('#btn_mute_video').removeClass('lightColor');
            $('#btn_mute_video').attr('src','../resources/images/icons/videoOn.png');
        }
    });
}


function setConfirmUnload(on) {
    window.onbeforeunload = (on) ? unloadMessage : null;
}

function unloadMessage() {
    return "__Are you sure you want to leave this page?";
}