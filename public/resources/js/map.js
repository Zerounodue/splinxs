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
var touristPosMarker;
var greenMarker;
var blueMarker;



/*user position marker */
var symbolLeft = {
    path: 'M10.5,0L10.5,22.4L0,30L10.5,0',
    strokeColor: '#2485c4',
    fillColor: '#2485c4',
    fillOpacity: 1,
    scale:1,
    rotation:0
};
var symbolRight = {
    path: 'M10.5,0L10.5,22.4L21,30L10.5,0',
    strokeColor: '#175278',
    fillColor: '#175278',
    fillOpacity: 1,
    scale:1,
    rotation:0
};
var line;
/*user position marker */

//var defaultLocation = {lat: 46.947248, lng: 7.451586}; //Bern
//Bundesplatz Bern
var defaultLocation = {lat: 46.947098, lng: 7.444146};

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
        icon: blueMarker
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
    touristPos=pos;
    //line.path=[pos, pos];

    //line.setMap(null);
    //line.setMap(map);

    //userMarker.setPosition(pos);
    line.setMap(null);
    line=null;
    line = new google.maps.Polyline({
        path: [pos, pos],
        icons: [
            {
                icon: symbolLeft,
                //offset: '0%'
            }, {
                icon: symbolRight,
                //offset: '50%'
            }
        ],

        map: map
    });
}
/**
 * sets the orientataion of the tourist marker
 * @param {int} orient orientataion
 */
function setTouristOrientation(orient) {
    if(showLogs) console.log('tourist orientation: ' + orient);
    //userMarker.setMap(null);
    //touristPosMarker.rotation = 45;
    symbolLeft.rotation=orient;
    symbolRight.rotation=orient;


    //line.setMap(null);
    //line.setMap(map);
    //line.icons=icons;
    //line.map =map;
    ////userMarker.icon= touristPosMarker;
    //userMarker.icon.rotation=45;
    //userMarker.setMap(map);
}
/**
 * adds the tourist's marker to the map
 * @param {Object {double, double}} pos to set marker
 */
function addTouristMarker(pos) {
    if(showLogs) console.log('add user marker');
    touristPos=pos;
    /*
    touristPosMarker = {
        url: '/resources/images/icons/positionArrow.svg',
        size: new google.maps.Size(42, 60),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 15),
        scaledSize: new google.maps.Size(21, 30),
        rotation: 45

    };
    */
    symbolLeft.origin= new google.maps.Point(0, 0);
    symbolLeft.anchor= new google.maps.Point(11, 15);
    symbolLeft.scaledSize= new google.maps.Size(21, 30);
    symbolRight.origin= new google.maps.Point(0, 0);
    symbolRight.anchor= new google.maps.Point(11, 15);
    symbolRight.scaledSize= new google.maps.Size(21, 30);
    // Create the polyline and add the symbols via the 'icons' property.
     line = new google.maps.Polyline({
        path: [pos, pos],
        icons: [
            {
                icon: symbolLeft,
                //offset: '0%'
            }, {
                icon: symbolRight,
                //offset: '50%'
            }
        ],

        map: map
    });
    /*
    userMarker = new google.maps.Marker({
        position: pos,
        icons: symbolLeft,
        map: map
    });
    */
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
            if ((position.coords.heading != null) && (!isNaN(position.coords.heading))) {
                touristOrient = position.coords.heading;
            }

            sendTouristLocationOrientation();
            //map.setCenter(pos);
        }, function (error) { //error function
            //user did not allow google maps
            if(showLogs) console.log('The Geolocation service failed');
            if (error.code == error.PERMISSION_DENIED){
                if(showLogs) console.warn('Location: permission denied');
            }
            else{
                if(showLogs) console.warn('Impossible get location');
            }

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
    centerAndResize();
}

//TODO do... and in .connection.js as well
function checkValidLocation(){
    
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}


//TODO test this
// Deletes all markers in the array by removing references to them.
function deleteAllMarkers() {
    clearMarkers();
    markers = [];
}

function centerAndResize(){
    map.setCenter(touristPos);
    map.setZoom(15);
}

window.addEventListener('deviceorientation', function(e) {
    /*
    var heading = 'heading: ' + e.webkitCompassHeading +
        '\n' +
        'headingAccuracy: ' + e.webkitCompassAccuracy;
    alert(heading);
    */

    touristOrient =  e.webkitCompassHeading;
    sendTouristLocationOrientation();
    setTouristOrientation(touristOrient);

}, false);