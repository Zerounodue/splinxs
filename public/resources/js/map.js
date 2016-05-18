/**
 * map.js
 * contains functions for the map
 * used by guides and tourists
 */

//variables
var map;
var geocoder;
var markers = [];
var markerCount = 0;
var userMarker = null;
var touristPos = {lat: 0, lng: 0};
var touristOrient = 0;

var greenMarker;
var blueMarke;


//var defaultLocation = {lat: 46.947248, lng: 7.451586}; //Bern
var defaultLocation = {lat: 0, lng: 0};

//used to delay click to allow doubleclick
var click_timeout;
var click_timeoutTimer = 200; //ms
/*
var updateIntervals = { //ms
    off: -0,
    batman: 60000,
    spiderman: 30000,
    ironman: 10000,
    superman: 5000,
    flash: 1000
};
var updateIntervalTimer = updateIntervals.ironman;
var updateInterval;
*/

/**
 * callback when the map script has been successfully loaded
 */
function initMap() {
    if(showLogs) console.log('init map');
    map = new google.maps.Map(document.getElementById('hammerContainer'), {
        center: defaultLocation,
        zoom: 3,
        zoomControl: true,
        zoomControlOptions : {
            position    : google.maps.ControlPosition.LEFT_BOTTOM,
        },
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });
    
    addMapListeners();
    addTouristMarker(defaultLocation);
    //create teh marker icons
    greenMarker = {
        url: '/resources/images/icons/greenMarker.png',
        size: new google.maps.Size(46, 64),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 32),
        scaledSize: new google.maps.Size(23, 32)
    };
    blueMarker = {
        url: '/resources/images/icons/blueMarker.png',
        size: new google.maps.Size(46, 64),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 32),
        scaledSize: new google.maps.Size(23, 32)
    };
}
/**
 * triggers the resize event
 */
function resizeMap(){
    google.maps.event.trigger(map, 'resize');
    map.setCenter(defaultLocation);
}
/**
 * adds listeners on the map element
 */
function addMapListeners() {
    if(showLogs) console.log('add map listeners');
    //place a marker or remove it
    map.addListener('click', function (event) {
        if(showLogs) console.log('map click');
        //waits ms for marker to be placed		
        click_timeout = setTimeout(function () {
            if(showLogs) console.log('map click timeout ended');
            //calls function in guide/tourist.map.js
            addGuideTouristMarker(++markerCount, event.latLng);
            var data = {add: true, id: markerCount, pos: event.latLng};
            sendMapData({marker: data});
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
 * @param {int} id id of marker
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addTouristsMarker(id, position){
    if(showLogs) console.log('add tourist marker');
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        //title: 'Hello World!',
        id: id,
        icon: blueMarke
        //icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    
    addMarker(marker);
}

/**
 * adds a new marker created by the guide to the map and saves it in an array
 * @param {int} id id of marker
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addGuidesMarker(id, position){
    if(showLogs) console.log('add guide marker');


    var marker = new google.maps.Marker({
        position: position,
        map: map,
        //title: 'Hello World!',
        id: id,
        icon: greenMarker
        //icon: '/resources/images/icons/greenMarker.png'
        //icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    
    addMarker(marker);
}

/**
 * adds a new marker to the map and saves it in an array
 * @param {Object} marker to add
 */
function addMarker(marker) {
    if(showLogs) console.log('add marker: ' + marker.id);
    
    markerCount = marker.id;
    
    marker.addListener('click', function (event) {
        var id = marker.id;
        if(showLogs) console.log('marker: ' + id + ' clicked');
        removeMarker(id);
        var data = {rem: true, id: id};
        sendMapData({marker: data});
    });

    markers.push(marker);
}
/**
 * removes the marker from the map and array
 * @param {int} id id of the marker to remove
 */
function removeMarker(id) {
    if(showLogs) console.log('removing marker: ' + id);
    //marker.setMap(null);
    markers = jQuery.grep(markers, function (value) {
        if(value.id != id){
            return value.id != id;
        }else{
            value.setMap(null);
        }
    });
}
/**
 * sets the position of the tourist marker
 * @param {Object {double, double}} pos to set tourist marker
 */
function setTouristLocation(pos){
    if(showLogs) console.log('tourist location lat: ' + pos.lat + ' lng: ' + pos.lng);
    userMarker.setPosition(pos);
}
/**
 * sets the orientataion of the tourist marker
 * @param {int} orient orientataion
 */
function setTouristOrientation(orient) {
    if(showLogs) console.log('tourist orientation: ' + orient);
    userMarker.setMap(null);
    userMarker.icon.rotation = orient;
    userMarker.setMap(map);
}
/**
 * adds the tourist's marker to the map
 * @param {Object {double, double}} pos to set marker
 */
function addTouristMarker(pos) {
    if(showLogs) console.log('add user marker');
    userMarker = new google.maps.Marker({
        position: pos,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            rotation: 0
        },
        map: map
    });
}
/*
function sendUpdateInterval(interval) {
    if(showLogs) console.log('sending interval: ' + interval);
    var data = null;
    
    switch(interval){
        case updateIntervals.off:
            data = {updateInterval: updateIntervals.off};
            break;
        case updateIntervals.batman:
            data = {updateInterval: updateIntervals.batman};
            break;
        case updateIntervals.spiderman:
            data = {updateInterval: updateIntervals.spiderman};
            break;
        case updateIntervals.ironman:
            data = {updateInterval: updateIntervals.ironman};
            break;
        case updateIntervals.superman:
            data = {updateInterval: updateIntervals.superman};
            break;
        case updateIntervals.flash:
            data = {updateInterval: updateIntervals.flash};
            break;
        default:
            data = null;
            break;
    }
    if(data != null){
        sendMapData(data);
    }
}
*/
/*
function setUpdateInterval(interval){
    if(showLogs) console.log('update interval: ' + interval);
    switch(interval){
        case updateIntervals.off:
            if(showLogs) console.log('update interval off');
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.off;
            break;
        case updateIntervals.batman:
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.batman;
            break;
        case updateIntervals.spiderman:
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.spiderman;
            break;
        case updateIntervals.ironman:
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.ironman;
            break;
        case updateIntervals.superman:
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.superman;
            break;
        case updateIntervals.flash:
            clearInterval(updateInterval);
            updateIntervalTimer = updateIntervals.flash;
            break;
        default:
            if(showLogs) console.warn('invalid update interval');
            break;
    }
    if(updateIntervalTimer > 0){
        updateInterval = setInterval(function(){ 
            if(showLogs) console.log('update interval interval timer: ' + updateIntervalTimer);
            sendTouristLocationOrientation();
        }, updateIntervalTimer);
    }
}
*/
/**
 * gets the tourist's geo location
 * and sends it to the guide
 */
function getGEOLocation() {
    // Try HTML5 geolocation.
    
    if (navigator.geolocation) {
        watchID = navigator.geolocation.watchPosition(function (position) {
            touristPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            //stop watching (updating and trying to get the position) when the position is found
            navigator.geolocation.clearWatch(watchID);
            sendTouristLocationOrientation();
            //map.setCenter(pos);
        }, function () {
            if(showLogs) console.warn('The Geolocation service failed');
        });
    } else {
        // Browser doesn't support Geolocation
        if(showLogs) console.warn('Your browser does not support geolocation');
    }
}
/*
function getGEOLocation() {
    // Try HTML5 geolocation.
    var pos = {lat: null, lng: null};

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            //map.setCenter(pos);
        }, function () {
            if(showLogs) console.warn('The Geolocation service failed');
        });
    } else {
        // Browser doesn't support Geolocation
        if(showLogs) console.info('Your browser does not support geolocation');
    }
    
    return pos;
}
*/
/**
 * gets the tourist's orientation
 */
function getOrientation(){
    //TODO implement
    touristOrient = new Date().getSeconds() * 6;
}
/**
 * sends the tourist's location and orientation
 */
function sendTouristLocationOrientation(){
    if(showLogs) console.log('sending tourist location orientation');
    //var pos = getGEOLocation();

    var data = {tourist: { pos: null, orientation: null }};
    if(touristPos.lat != null && touristPos.lng != null){
        data.tourist.pos = touristPos;
        //set position on tourist map
        setTouristLocation(touristPos);
    }
    if(touristOrient > -1){
        data.tourist.orientation = touristOrient;
        //set orientation on tourist map
        setTouristOrientation(touristOrient);
    }
    if(data.tourist != null){
        sendMapData(data);
    }else{
        if(showLogs) console.warn('invalid orientation location, will not send to guide');
    }
}

function updateTouristLocationOrientation(){
    getOrientation();
    getGEOLocation();
}

//TODO do... and in .connection.js as well
function checkValidLocation(){
    
}