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
 * index.functions.js
 * contains functions for scrolling & ui elements in the index site
 * used in the index and login
 */

var showLogs = true;
var animDur = 400;

$(document).ready(function () {
    if(showLogs) console.log('document index.functions ready');

    loginPopup = $('loginPopup');
    registerPopup = $('registerPopup');
    okPopup = $('registartionOKPopup');

    //for registration
    $("#papssword").blur(validate);
    $("#papssword_confirm").blur(validate);

    //index
    $("#navbar-brand-scroll").on('click', function(e){
        if(showLogs) console.log('navbar logo clicked');
        scrollTo('#body');
    });
    $("#btn-guide").on('click', function(e){
        if(showLogs) console.log('info ok button clicked');
        loginPopup.show(animDur);
        disableScroll();
        if($(window).height()<360){
            //alert("You might need a bigger screen");
            $("#smallScreenDialog").show();
        }
    });

    //login page
    $("#x-login-img").on('click', function(e){
        if(showLogs) console.log('x login image clicked');
        hideAndScroll(true);
    });
    $("#btn-close-login").on('click', function(e){
        if(showLogs) console.log('btn logine close clicked');
        hideAndScroll(true);
    });
    $("#btn-submit-login").on('click', function(e){
        if(showLogs) console.log('btn submit login clicked');
        //submit only with a capable browser
        if(Modernizr.geolocation && Modernizr.eventlistener && Modernizr.input && Modernizr.inputtypes && Modernizr.json && Modernizr.websockets && Modernizr.datalistelem && Modernizr.localstorage &&  Modernizr.getusermedia &&  Modernizr.datachannel &&  Modernizr.peerconnection){
            $('#loginForm .submit').click();
        }
        else{
            $('#badBrowserLoginDialog').show();
        }
        
    });

    $("#a-register").on('click', function(e){
        if(showLogs) console.log('regiser link clicked');
        loginPopup.hide(0);
        registerPopup.show(0);

    });

    //register page
    $("#x-register-img").on('click', function(e){
        if(showLogs) console.log('x register image clicked');
        hideAndScroll(false);
    });
    $("#btn-register-close").on('click', function(e){
        if(showLogs) console.log('x register image clicked');
        hideAndScroll(false);
    });
    $("#a-login").on('click', function(e){
        if(showLogs) console.log('back to login link clicked');
        loginPopup.show(0);
        registerPopup.hide(0);
    });
    $("#btn-ok-close").on('click', function(e){
        if(showLogs) console.log('ok btn clicked');
        okPopup.hide(0);
        loginPopup.show(0);
    });
    $("#x-ok-img").on('click', function(e){
        if(showLogs) console.log('x btn clicked');
        okPopup.hide(animDur);
    });
    $(".alertDialogClose").on('click', function(e){
        $("#badBrowserDialog").hide(animDur);
        $("#smallScreenDialog").hide(animDur);
        $("#badBrowserLoginDialog").hide(animDur);
    });

    if(Modernizr.geolocation && Modernizr.eventlistener && Modernizr.input && Modernizr.inputtypes && Modernizr.json && Modernizr.websockets && Modernizr.datalistelem && Modernizr.localstorage &&  Modernizr.getusermedia &&  Modernizr.datachannel &&  Modernizr.peerconnection){
        if(showLogs) console.log('Good browser');
    }
    else{
        if(showLogs) console.log('The browser is bullshit');
        $("#badBrowserDialog").show();
    }

    //close the collapsed navbar (movile view) after clicking on it
    $('.liClose').click('liClose', function() {
        $('.navbar-collapse').collapse('hide');
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
    var pw1 = document.getElementById('password');
    if(password1.length > 0 && password2.length > 0){
        if (password1 == password2) {
            $( "#firstPasswordGroup" ).removeClass( "has-error" );
            $( "#secondPasswordGroup" ).removeClass( "has-error" );
            pw1.setCustomValidity("");
        } else {
            $( "#firstPasswordGroup" ).addClass( "has-error" );
            $( "#secondPasswordGroup" ).addClass( "has-error" );
            pw1.setCustomValidity("__Passwords do not match");
        }
    }
}