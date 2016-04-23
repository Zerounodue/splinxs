/**
 * guide.ui.js
 * contains functions related with the ui on the guide side
 * used by guides
 */
var modalDialog;
var modalContent;
var mapControls;

/**
 * initialises ui variables for guide
 * !needs to be called in document.ready()!
 */
function initGuideUI(){
    if(showLogs) console.log('guide: init gui');
    modalDialog = $("#modalDialog");
    modalContent = $("#modalContent");
    mapControls = $("#mapControls");

    initGuideButtons();
    initChat();
}

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
        stopVideo();
    });

    $("#btn_closeConnection").click(function (e) {
        if (showLogs) console.log('closing connection');
        closeConnection();
    });

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
    
}