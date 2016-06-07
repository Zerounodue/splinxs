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
 * guide.map.js
 * contains functions for the map
 * used by guides
 */

/**
 * adds a new marker created by the guide to the map and saves it in an array
 * @param {int} id id of marker
 * @param {Object {double, double}} position lat lng of the marker to set
 */
function addGuideTouristMarker(id, position){
    addGuidesMarker(id, position);
}