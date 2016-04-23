/**
 * tourist.loccation.js
 * contains functions for selecting the location
 * used by tourists
 */

//variables
var showLogs = true;
var map;
var marker;

var animDur = 250;

var defaultLocation = {lat: 0, lng: 0};
//used to delay click to allow doubleclick
var click_timeout;
var click_timeoutTimer = 200; //ms
//DOM elements
var locForm;
var loadPopup;
var infoPopup;
var declinedPopup;

/**
 * callback when the map script has been successfully loaded
 */
function initMap(){
    if(showLogs) console.log('init map');
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 3,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });
    
    addMapListeners();
    addMarker(defaultLocation);
    getGEOLocation();
}
/**
 * adds listeners on the map element
 */
function addMapListeners(){
    console.log("add map listeners");
    //place a marker or remove it
    map.addListener('click', function (event) {
        if(showLogs) console.log('map click');
        //waits ms for marker to be placed		
        click_timeout = setTimeout(function () {
            if(showLogs) console.log('map click timeout ended');
            updateMarker(event.latLng);
        }, click_timeoutTimer);
    });
    //double click zooms
    map.addListener('dblclick', function (event) {
        if(showLogs) console.log('doubleclick, zoom level: ' + map.getZoom());
        clearTimeout(click_timeout);
    });
}
/**
 * adds a new marker created by the tourist to the map and saves it in an array
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addMarker(position) {
    if(showLogs) console.log('add marker');
    
    marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    /* not needed
    marker.addListener('click', function (event) {
        if(showLogs) console.log('marker clicked');
    });
    */
}
/**
 * gets the geo location
 */
function getGEOLocation() {
    showLoadPopup();
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            updateMarker(pos);
            hideLoadPopup();
        }, function () { //error function
            //user did not allow google maps
            if(showLogs) console.warn('The Geolocation service failed');
            hideLoadPopup();
            showDeclinedPopup();
        });
    } else {
        // Browser doesn't support Geolocation
        if(showLogs) console.info('Your browser does not support geolocation');
        hideLoadPopup();
        showDeclinedPopup();
    }
}
/**
 * sets the marker to the given position
 * @param {object{lat: double, lng: double}} pos to set marker at
 */
function updateMarker(pos){
    if(showLogs) console.log("update marker");
    if(isValidGEOPosition(pos)){
        marker.setPosition(pos);
    }else{
        if(showLogs) console.log("invalid position");
    }
}

$(document).ready(function () {
    if(showLogs) console.log('document ready');
    
    locForm = $("#frm_location");
    loadPopup = $('loadPopup');
    infoPopup = $('infopopup');
    declinedPopup = $('declinedPopup');
    
    $("#img_location").on('click', function(e){
       if(showLogs) console.log('location img clicked');
        getGEOLocation();
    });
    
    $("#btn_submit").on('click', function (e) {
        if(showLogs) console.log('submit button clicked');
        if(isValidGEOPosition(marker.position)){
            submitLocation();
        }else{
            //prevent form from being submitted
            return false;
        }
    });
    
    $("#btn_info").on('click', function(e){
       if(showLogs) console.log('info button clicked');
        showInfoPopup();
    });
    
    $("#btn_infoOk").on('click', function(e){
       if(showLogs) console.log('info ok button clicked');
        hideInfoPopup();
    });
    
    
    $("#img_infoClose").on('click', function(e){
       if(showLogs) console.log('info close img clicked');
        hideInfoPopup();
    });
    /*
    $("#btn_loadClose").on('click', function(e){
       if(showLogs) console.log('load close button clicked');
        hideLoadPopup();
    });
    
    $("#img_loadClose").on('click', function(e){
       if(showLogs) console.log('load close img clicked');
        hideLoadPopup();
    });
    */
    $("#btn_declinedClose").on('click', function(e){
       if(showLogs) console.log('declined close button clicked');
        hideDeclinedPopup();
    });
    
    $("#img_declinedClose").on('click', function(e){
       if(showLogs) console.log('declined close img clicked');
        hideDeclinedPopup();
    });
    
});

function showInfoPopup(){
    infoPopup.show(animDur);
}

function hideInfoPopup(){
    infoPopup.hide(animDur);
}

function showLoadPopup(){
    loadPopup.show(animDur);
}

function hideLoadPopup(){
    loadPopup.hide(animDur);
}

function showDeclinedPopup(){
    declinedPopup.show(animDur);
}

function hideDeclinedPopup(){
    declinedPopup.hide(animDur);
}

function getTouristLocation(){
    if(showLogs) console.log('get tourist location');
    getGEOLocation();
}
/**
 * checks if the given position is valid (only if lat and lng are not null)
 * @param {Object{lat: double, lng: double}} pos
 * @returns {Boolean} true if lat and lng are valid (not null)
 */
function isValidGEOPosition(pos){
    return (pos.lat != null && pos.lng != null);
}

function submitLocation(){
    var pos = JSON.stringify(marker.position);
    
    locForm.empty();
     $('<input id=\'location\'/>').attr('type', 'hidden')
          .attr('name', "position")
          .attr('value', pos)
          .appendTo('#frm_location');
    locForm.submit();
}