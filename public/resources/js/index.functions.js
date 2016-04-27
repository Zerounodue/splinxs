/**
 * index.functions.js
 * contains functions for scrolling
 * used in the index and login 
 */


var showLogs = true;
var animDur = 400;

$(document).ready(function () {
    if(showLogs) console.log('document ready');

    loginPopup = $('loginPopup');


    $("#navbar-brand-scroll").on('click', function(e){
        if(showLogs) console.log('navbar logo clicked');
        scrollTo('#body');
    });
    $("#btn-guide").on('click', function(e){
        if(showLogs) console.log('info ok button clicked');
        loginPopup.show(animDur);
        disableScroll();
    });
    $("#x-login-img").on('click', function(e){
        if(showLogs) console.log('x login image clicked');
        hideAndScroll();
    });
    $("#btn-close-login").on('click', function(e){
        if(showLogs) console.log('btn logine close clicked');
        hideAndScroll();
    });

});

function hideAndScroll(){
    loginPopup.hide(animDur);
    enableScroll();
}



//check if browser supports all features
DetectRTC.load(function () {
    if (DetectRTC.hasMicrophone) {
        // seems current system has at least one audio input device
        console.log('has microphone');
    }
    if (DetectRTC.hasSpeakers) {
        // seems current system has at least one audio output device
        console.log('has speakers');
    }
    if (DetectRTC.hasWebcam) {
        // seems current system has at least one video input device
        console.log('has webcam');
    }
    if (!DetectRTC.isWebRTCSupported) {
        // seems no WebRTC compatible client
        console.log('does not support WebRTC');
        showError();
    }
    if (DetectRTC.isAudioContextSupported) {
        // seems Web-Audio compatible client
        console.log('Web-Audio ok');
    }
    if (DetectRTC.isScreenCapturingSupported) {
        // seems WebRTC screen capturing feature is supported on this client
        console.log('screen capturing ok');
    }
    if (DetectRTC.isSctpDataChannelsSupported) {
        // seems WebRTC SCTP data channels feature are supported on this client
        console.log('SCTP ok');
    }
    if (DetectRTC.isRtpDataChannelsSupported) {
        // seems WebRTC (old-fashioned) RTP data channels feature are supported on this client
        console.log('RTP data channel ok');
    }
});
function showError() {
    var startSection = $("#startSection");
    var errorSection = $("#errorSection");
    startSection.hide();
    errorSection.show();
}



var animating = false;
/*Scroll transition to anchor*/
function scrollTo(section) {
    //animate only if it's not already animating
    if (!animating) {
        animating = true;
        $('body').animate({
                scrollTop: $(section).offset().top
            }, 750, function () {
                animating = false;
            }
        );
    }
    return false;
};


function disableScroll(){
    $( "#body" ).addClass( "indexBody" );
}
function enableScroll(){
    $( "#body" ).removeClass( "indexBody" );
}