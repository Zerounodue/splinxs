/**
 * tourist.map.js
 * contains functions for the map
 * used by tourists
 */

//variables

/**
 * adds a new marker created by the tourist to the map and saves it in an array
 * @param {int} id id of marker
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addGuideTouristMarker(id, position){
    addTouristsMarker(id, position);
}