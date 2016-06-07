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
 * guide.ui.js
 * contains functions related with the ui on the guide side
 * used by guides
 */
var modalDialog;
var modalContent;
var mapControls;
var ico_audio;
var ico_video;
var waitingBox;
var sureWantLeaveDialog;

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
    ico_audio = $("#ico_audio");
    ico_video = $("#ico_video");
    waitingBox = $("#waitingBox");
    sureWantLeaveDialog = $("#sureWantLeaveDialog");
    
    //setConfirmUnload(true);
    initGuideButtons();
    initChat();
}

function setAvailable(){
    guideSocketSendState(guideStates.available);
    $("#spn_stateU").hide();
    $("#spn_stateA").show();

    $("#btn_available").show();
    $("#btn_unavailable").hide();
}
function setUnavailable(){
    guideSocketSendState(guideStates.unavailable);
    $("#spn_stateA").hide();
    $("#spn_stateU").show();

    $("#btn_available").hide();
    $("#btn_unavailable").show();
}

function hideAudioVideoIcons(){
    $("#ico_audio").hide();
    $("#ico_video").hide();
}

function hideGuideControls(){
    $("#videoControlsDialog").hide(animDur);
}

function showGuideControls(){
    $("#videoControlsDialog").show(animDur);
}

function showModalDialog(content) {
    modalContent.text(content);
    modalDialog.show();
}

function hideModalDialog(){
    modalDialog.hide();
}
function showWaitingBox(){
    waitingBox.show();
}

function hideWaitingBox(){
    waitingBox.hide();
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
        hideWaitingBox();
        playSound(sounds.call_answer);

    });

    $("#modalNo").click(function () {
        if (showLogs) console.log('guide: modalNo button clicked');
        //send declined to tourist
        guideDeclinesRequest();
        hideTouristRequestGuidePrompt();
    });

    //closes the tourist's connection, the guide stays connected
    $("#btn_closeConnection").click(function (e) {
        if (showLogs) console.log('closing connection');
        closeConnection();
    });

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
        setUnavailable();
    });

    $("#btn_unavailable").click(function (e) {
        if(showLogs) console.log('btn unavailable clicked');
        setAvailable();
    });
    $("#controlsBtn").on('click', function(e){
        if(showLogs) console.log('guideControlsBtn  button clicked');
        $('.navbar-collapse').collapse('hide');
        showGuideControls();
    });
    
    $(".closeVideoControlsDialog").on('click', function(e){
        if(showLogs) console.log('guide close button clicked');
        hideGuideControls();
    });

    $("#btn_gps_guide").on('click', function(e){
        centerAndResize();
    });

    //closes the tourist's connection, the guide stays connected
    $("#hangUp, #hangUpCollapse").click(function (e) {
        if (showLogs) console.log('guide: closing connection');
        sureWantLeaveDialog.show(animDur);
    });

    $("#leaveYes").on('click', function(e){
        sureWantLeaveDialog.hide(animDur);
        closeConnection();
    });
    $("#leaveNo, #sureWantLeaveDialog_X").on('click', function(e){
        sureWantLeaveDialog.hide(animDur);
    });

    $("#ico_audio").click(function (e) {
        if (showLogs) console.log('guide: audio icon clicked, will mute: ' + !audioMuted);
        if(audioMuted){
            //unmute audio
            ico_audio.removeClass('lightColor');
            ico_audio.attr('src','../resources/images/icons/microphoneOn.png');
            unmuteAudio();
        }
        else{
            //mute audio
            ico_audio.addClass('lightColor');
            ico_audio.attr('src','../resources/images/icons/microphoneOff.png');
            muteAudio();
        }
        audioMuted = !audioMuted;
    });

    $("#ico_video").click(function (e) {
        if (showLogs) console.log('guide: video icon clicked, will mute: ' + !videoMuted);
        if(videoMuted){
            //start video
            ico_video.removeClass('lightColor');
            ico_video.attr('src','../resources/images/icons/videoOn.png');
            //unmute video
            showVideo();
        }
        else{
            //stop video
            ico_video.addClass('lightColor');
            ico_video.attr('src','../resources/images/icons/videoOff.png');
            //mute video
            hideVideo();

        }
        videoMuted = !videoMuted;
    });

    $(".leftDialogClose").click(function (e) {
        $('#leftDialog').hide(animDur);
        connectionClosed();
    });
    $(".toLateDialogClose").click(function (e) {
        $('.modalDialog').hide(animDur);
    });
}


function muteAudio(){
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.id == audioStream) {
                if (showLogs) console.log('guide: muting audio stream');
                stream.mute();
            }
        }
    });
}

function unmuteAudio(){
    connection.attachStreams.forEach(function (stream) {
        if (stream.type == "local") {
            if (stream.id == audioStream) {
                if (showLogs) console.log('guide: unmuting audio stream');
                stream.unmute();
            }
        }
    });
}

