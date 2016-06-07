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
var greenMarker;
var blueMarker;
var line;
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


//used to delay click to allow doubleclick
var click_timeout;
var click_timeoutTimer = 200; //ms

/**
 * callback when the map script has been successfully loaded
 */
function initMap() {
    if(showLogs) console.log('init map');
    map = new google.maps.Map(document.getElementById('hammerContainer'), {
        center: touristPos,
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
    addTouristMarker();
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
    map.setCenter(touristPos);
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
        id: id,
        icon: blueMarker
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
        id: id,
        icon: greenMarker
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
    if(line != null)line.setMap(null);

    line = new google.maps.Polyline({
        path: [touristPos, touristPos],
        icons: [
            {
                icon: symbolLeft,
            }, {
                icon: symbolRight,
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
    if(line == null){
        line = new google.maps.Polyline({
            path: [touristPos, touristPos],
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

    if(line != null) {
        line.setMap(null);
        line.setMap(map);
    }
}

/**
 * adds the tourist's marker to the map
 * @param {Object {double, double}} pos to set marker
 */
function addTouristMarker() {
    if(showLogs) console.log('add user marker');

    symbolLeft.origin= new google.maps.Point(0, 0);
    symbolLeft.anchor= new google.maps.Point(11, 15);
    symbolLeft.scaledSize= new google.maps.Size(21, 30);
    symbolRight.origin= new google.maps.Point(0, 0);
    symbolRight.anchor= new google.maps.Point(11, 15);
    symbolRight.scaledSize= new google.maps.Size(21, 30);
    // Create the polyline and add the symbols via the 'icons' property.
    line = new google.maps.Polyline({
        path: [touristPos, touristPos],
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
    if(touristPos.lat == 0 && touristPos.lng == 0 ){
        //remove the tourist position marker 
        line.setMap(null);
        line=null;
    }
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

// Deletes all markers in the array by removing references to them.
function deleteAllMarkers() {
    clearMarkers();
    markers = [];
}

function centerAndResize(){
    map.setCenter(touristPos);
    map.setZoom(15);
}