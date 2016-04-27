/**
 * tourist.loccation.js
 * contains functions for selecting the location
 * used by tourists
 */

//variables
var showLogs = true;
var map;
var marker;

var permissionDenied="#{false}";
var animDur = 400;

//used to watchPosition and to clearWatch() --> stop watching position
var watchID;

var defaultLocation = {lat: 0, lng: 0};
//used to delay click to allow doubleclick
var click_timeout;
var click_timeoutTimer = 200; //ms
//DOM elements
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
        scaleControl: false,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });
    
    addMapListeners();
    //addMarker(defaultLocation);
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
            updateMarker(event.latLng, map);
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
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
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
        watchID = navigator.geolocation.watchPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            //stop watching (updating and trying to get the position) when the position is found
            navigator.geolocation.clearWatch(watchID);
            map.setCenter(pos);
            updateMarker(pos, map);
            hideLoadPopup();
            map.setZoom(15);
            fillTryAgainDiv();
        }, function (error) { //error function
            //user did not allow google maps
            if(showLogs) console.warn('The Geolocation service failed');
            if (error.code == error.PERMISSION_DENIED){
                document.getElementById('errorMessage').innerHTML = permissionError;

            }
            else{
                document.getElementById('errorMessage').innerHTML = otherError
                fillTryAgainDiv();

            }
            hideLoadPopup();
            showDeclinedPopup();
        });

    } else {
        // Browser doesn't support Geolocation
        if(showLogs) console.info('Your browser does not support geolocation');
        hideLoadPopup();
        showDeclinedPopup();
        fillTryAgainDiv();
    }
}
/**
 * sets the marker to the given position
 * @param {object{lat: double, lng: double}} pos to set marker at
 */
function updateMarker(pos, map){
    if(showLogs) console.log("update marker");
    if(isValidGEOPosition(pos)){
        if(!marker){
            addMarker(pos);
            map.setZoom(15);
        }
        else {
            marker.setPosition(pos);
        }
        map.panTo(pos);

    }else{
        if(showLogs) console.log("invalid position");
    }
}




$(document).ready(function () {
    if(showLogs) console.log('document ready');

    loadPopup = $('loadPopup');
    infoPopup = $('infopopup');
    declinedPopup = $('declinedPopup');
    

    
    $("#btn_submit").on('click', function (e) {
        if(showLogs) console.log('submit button clicked');
        if(marker && isValidGEOPosition(marker.position)){
            submitLocation();
        }else{
            //prevent form from being submitted
            //return false;
            showInfoPopup();
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

    $("#btn_loadClose").on('click', function(e){
       if(showLogs) console.log('load close button clicked');
        //stop watching (updating and trying to get the position) if the user close the popup
        navigator.geolocation.clearWatch(watchID);
        hideLoadPopup();
    });
    
    $("#img_loadClose").on('click', function(e){
       if(showLogs) console.log('load close img clicked');
        //stop watching (updating and trying to get the position) if the user close the popup
        navigator.geolocation.clearWatch(watchID);
        hideLoadPopup();
    });

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

function fillTryAgainDiv(){
    document.getElementById('tryAgain').innerHTML = '<a id="btn_infoLocation" class="btn btn-default btn-white btn-map">'+tryAgainMessage+'</a>';
    $("#btn_infoLocation").on('click', function(e){
        hideInfoPopup();
        if(showLogs) console.log('location img clicked');
        getGEOLocation();
    });
}

function submitLocation(){
    var pos = JSON.stringify(marker.position);
    
    // Create the form object
    var locForm = document.createElement("form");
    locForm.setAttribute("method", "post");
    locForm.setAttribute("action", "/touristLocation");
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "position");
    hiddenField.setAttribute("value", pos);
    // append the newly created control to the form
    locForm.appendChild(hiddenField);
    document.body.appendChild(locForm); // inject the form object into the body section
    locForm.submit();
}