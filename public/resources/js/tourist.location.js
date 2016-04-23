/**
 * tourist.loccation.js
 * contains functions for selecting the location
 * used by tourists
 */

//variables
var showLogs = true;
var map;
var marker;

var defaultLocation = {lat: 46.947248, lng: 7.451586}; //Bern
//used to delay click to allow doubleclick
var click_timeout;
var click_timeoutTimer = 200; //ms

var locForm;

/**
 * callback when the map script has been successfully loaded
 */
function initMap(){
    if(showLogs) console.log('init map');
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 10,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });
    
    addMapListeners();
    
    var pos = getGEOLocation();
    if(isValidGEOPosition(pos)){
        addMarker(pos);
        map.setCenter(pos);
    }else{
        //TODO do something
        addMarker(defaultLocation);
    }
    
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
    // Try HTML5 geolocation.
    var pos = {lat: null, lng: null};

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        }, function () { //error function
            //user did not allow google maps
            if(showLogs) console.warn('The Geolocation service failed');
            alert("__please allow to use your location");
        });
    } else {
        // Browser doesn't support Geolocation
        if(showLogs) console.info('Your browser does not support geolocation');
    }
    
    return pos;
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
    
    $("#btn_getLocation").on('click', function (e) {
        if(showLogs) console.log('get location button clicked');
        getTouristLocation();
        
        
    });
    
    $("#btn_sendLocation").on('click', function (e) {
        if(showLogs) console.log('send location button clicked');
        if(isValidGEOPosition(marker.position)){
            submitLocation();
        }else{
            //prevent form from being submitted
            return false;
        }
    });
    
    
    
});

function getTouristLocation(){
    if(showLogs) console.log('get tourist location');
    var pos = getGEOLocation();
    console.log('lat: ' + pos.lat + ' lng: ' + pos.lng);
    if(isValidGEOPosition(pos)){
        if(showLogs) console.log('valid geo location');
        
    }else{
        if(showLogs) console.log('invalid geo location');
        alert("__invalid geo location");
        //TODO do smething
    }
    
    
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