/**
 * index.functions.js
 * contains functions for scrolling
 * used in the index and login
 */


var showLogs = true;
var animDur = 400;
var goodBrowser=false;

$(document).ready(function () {
    if(showLogs) console.log('document index.functions ready');
/*
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    /*
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    if (isChrome || isFirefox || isOpera || is) {
        //
        console.log('Browser '+ isChrome);
    }
*/
    if(Modernizr.geolocation && Modernizr.eventlistener && Modernizr.input && Modernizr.inputtypes && Modernizr.json && Modernizr.websockets && Modernizr.datalistelem && Modernizr.localstorage &&  Modernizr.getusermedia &&  Modernizr.datachannel &&  Modernizr.peerconnection){
        if(showLogs) console.log('Good browser');
        goodBrowser=true;
    }
    else{
        if(showLogs) console.log('The browser is bullshit');
        goodBrowser=false;
        alert("__\nYour browser does not support the required features\nWe recommend to use Google Chrome");
    }
    loginPopup = $('loginPopup');
    registerPopup = $('registerPopup');

    //for registration
    $("#papssword").blur(validate);
    $("#papssword_confirm").blur(validate);


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
        hideAndScroll(true);
    });
    $("#btn-close-login").on('click', function(e){
        if(showLogs) console.log('btn logine close clicked');
        hideAndScroll(true);
    });
    $("#a-register").on('click', function(e){
        if(showLogs) console.log('regiser link clicked');
        loginPopup.hide(0);
        registerPopup.show(0);
    });
    $("#x-register-img").on('click', function(e){
        if(showLogs) console.log('x register image clicked');
        hideAndScroll(false);
    });
    $("#btn-register-close").on('click', function(e){
        if(showLogs) console.log('x register image clicked');
        hideAndScroll(false);
    });






});

function hideAndScroll(isLogin){
    if(isLogin) {
        loginPopup.hide(animDur);
    }
    else{
        registerPopup.hide(animDur);
    }
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





//for registartion
function validate() {
    var password1 = $("#password").val();
    var password2 = $("#papssword_confirm").val();
    //custom validity does not seem to work with jquery...
    var pw1 = document.getElementById('password');
    //var pw2 = document.getElementById('papssword_confirm');

    if(password1.length > 0 && password2.length > 0){
        if (password1 == password2) {
            $( "#firstPasswordGroup" ).removeClass( "has-error" );
            $( "#secondPasswordGroup" ).removeClass( "has-error" );
            pw1.setCustomValidity("");
            //pw2.setCustomValidity("");
        } else {
            $( "#firstPasswordGroup" ).addClass( "has-error" );
            $( "#secondPasswordGroup" ).addClass( "has-error" );
            pw1.setCustomValidity("__Passwords do not match");

            //pw2.setCustomValidity("__Passwords do not match");
        }
    }


}