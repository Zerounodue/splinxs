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
 * tourist.map.js
 * contains functions for the map
 * used by tourists
 */

//variables
var touristOrient = 0;
var firstTime = true;
var data = {tourist: { pos: null, orientation: null }};
var lastOrientation = 0;
//orientation is send only if the difference is greater than minOrinetationChange
var minOrinetationChange =10;
/**
 * adds a new marker created by the tourist to the map and saves it in an array
 * @param {int} id id of marker
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addGuideTouristMarker(id, position){
    addTouristsMarker(id, position);
}

/**
 * gets the tourist's geo location
 * and sends it to the guide when it's updated
 */
function getGEOLocation() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        watchID = navigator.geolocation.watchPosition(function (position) {
            touristPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            if(touristPos.lat != null && touristPos.lng != null) {
                
                setTouristLocation(touristPos);
                sendTouristLocation();
                //center only the first time
                if(firstTime){
                    centerAndResize();
                    firstTime=false;
                }
            }
            else{
                if(showLogs) console.warn('Tourist: invalid  location, will not send to guide');
            }
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

/**
 * sends the tourist's location a
 */
function sendTouristLocation(){
    if(showLogs) console.warn('sending tourist location ');

    data.tourist.pos = touristPos;
    sendMapData(data);
}

/**
 * sends the tourist's orientation
 */
function sendTouristOrientation(touristOrient){
    if(showLogs) console.log('sending tourist  orientation');

    data.tourist.orientation = touristOrient;
    sendMapData(data);
}

function initToutistOrientation(){
    window.addEventListener('deviceorientation', function(e) {
        //only for webkit browser (iOS)
        if ( e.webkitCompassHeading != null) {
            touristOrient = e.webkitCompassHeading;
        }
        else{
            //Android
            if(e.alpha != null){
                touristOrient=e.alpha;
            }
            else{
                if (showLogs)console.log('tourist: impossible to get heading');
                return;
            }
        }
        if(touristOrient > -1){
            if( Math.abs(lastOrientation - touristOrient) > minOrinetationChange) {
                setTouristOrientation(touristOrient);
                sendTouristOrientation(touristOrient);
                lastOrientation = touristOrient;
            }
        }
        else{
            if(showLogs) console.log('Tourist: invalid  orientation, will not send to guide');
        }

    }, false);
}