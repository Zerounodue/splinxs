/**
 * tourist.ui.js
 * contains functions related with the ui on the tourist side
 * used by tourists
 */

//variables
var loadBox;
var content;

/**
 * initialises ui variables for tourist
 * !needs to be called in document.ready()!
 */
function initTouristUI(){
    if(showLogs) console.log('tourist: init gui');
    loadBox = $("#loadBox");
    content = $("#content");
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