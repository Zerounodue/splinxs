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
//
var minOrinetationChange =2;
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
            //not working
            /*
             if ((position.coords.heading != null) && (!isNaN(position.coords.heading))) {
             touristOrient = position.coords.heading;
             console.warn("OK"+touristOrient);
             }
             */
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
    /*
     if(touristPos.lat != null && touristPos.lng != null){
     data.tourist.pos = touristPos;
     //set position on tourist map
     setTouristLocation(touristPos);
     }
     */
    if(showLogs) console.warn('sending tourist location ');

    //var data = {tourist: { pos: null, orientation: null }};
    data.tourist.pos = touristPos;
    sendMapData(data);
    /*
    if(data.tourist != null){
        sendMapData(data);
    }else{
        if(showLogs) console.warn('Tourist: invalid  location, will not send to guide');
    }
    */
}

/**
 * sends the tourist's orientation
 */
function sendTouristOrientation(touristOrient){
    if(showLogs) console.log('sending tourist  orientation');

    //var data = data.tourist.orientation = touristOrient;
    data.tourist.orientation = touristOrient;
    sendMapData(data);
        //set orientation on tourist map
        //setTouristOrientation(touristOrient);


    /*
    if(data.tourist != null){

    }else{
        if(showLogs) console.warn('Tourist: invalid  orientation, will not send to guide');
    }
    */
}


function initToutistOrientation(){
    window.addEventListener('deviceorientation', function(e) {
        //if (showLogs)console.log('tourist: orientation changed');
        /*
         var heading = 'heading: ' + e.webkitCompassHeading +
         '\n' +
         'headingAccuracy: ' + e.webkitCompassAccuracy;
         alert(heading);
         */
        //only for webkit browser (iOS)
        if ( e.webkitCompassHeading != null) {
            touristOrient = e.webkitCompassHeading;
        }
        else{
            //android
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












//TODO function header here
function compassHeading(alpha, beta, gamma) {

    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if(rB < 0) {
        compassHeading += Math.PI;
    }else if(rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;

}