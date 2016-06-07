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
 * guide.knownArea.map.js
 * contains functions for marking certain regions on the map
 * used by guides
 */

//variables
var showLogs = false;
var map;
var drawingManager;
var searchBox;
var drawingModes;
var circles = [];
var circleCounter = 0;
var circleOptions = {
    fillColor: '#28B294',
    fillOpacity: 0.6,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    zIndex: 1,
    suppressUndo: true,
    strokeColor: '#2585C4'
};
var defaultLocation = {lat: 0, lng: 0};
//circles loaded from db
var existingCircles = null;

var animDur = 400;
var infoPopup;
var backArrow;

$(document).ready(function () {
    if (showLogs) console.log('guide areas document ready');
    if (!Modernizr.datalistelem) {
        $("#sb_places").hide();
        //remove the class that makes the element move when there is no place for the sb and the controls
        $("#mapControls").removeClass('controls-move');
        $("#mapInfos").removeClass('info-move');
    }
    infoPopup = $("#infoPopup");
    //areaForm = $("#frm_areas");
    backArrow =$("#backArrow");

    $("#btn_knownAreasContinue").click(function (e) {
        if(showLogs) console.log('knownAreasContinue button clicked');
        var n = getNumberOfCircles();
        if(n > 0){
            saveCircles();
        }else{
            //no areas are selected
            $("#nothingSelected").show();
        }

    });
    $(".nothingSelectedClose").click(function () {
        $("#nothingSelected").hide(animDur);
    });

    $("#mapControlRemoveCircles").click(function () {
        if(showLogs) console.log('mapControlRemoveCircles clicked');
        drawingManager.setDrawingMode(null);
        drawingManager.removeCircle = true;
    });
    $("#img_infoClose").click(function () {
        if(showLogs) console.log('img_infoClose clicked');
        infoPopup.hide(animDur);
    });
    $("#infoBottom").click(function () {
        if(showLogs) console.log('infoBottom clicked');
        infoPopup.hide(animDur);
    });

    $('.control').click(function() {
        //console.log($(this));
        $('.control').removeClass('selected-control');
        $(this).addClass('selected-control');
    });

    $("#mapControlPan").click(function () {
        if(showLogs) console.log('mapControlPan clicked');
        drawingManager.setDrawingMode(drawingModes.pan);
        drawingManager.removeCircle = false;
    });

    $("#mapControlAddCircles").click(function () {
        if(showLogs) console.log('mapControlAddCircles clicked');
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        drawingManager.removeCircle = false;
    });

    $("#mapInfoOpener").click(function () {
        if(showLogs) console.log('mapInfoOpener clicked');
        drawingManager.setDrawingMode(drawingModes.pan);
        drawingManager.removeCircle = false;
        infoPopup.show(animDur);
    });

});

/**
 * callback when the map script has been successfully loaded
 */
function initMap() {
    if (showLogs) console.log('initialising guide areas map');
    map = new google.maps.Map($("#map")[0],{
        center: defaultLocation,
        zoom: 2,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });

    addKnownAreaMapListeners();
    initDrawingManager();
    
    drawingModes = {
        pan: null,
        circle: google.maps.ControlPosition.TOP_CENTER
    };
    
    initSearchBox();
    loadExistingCircles();
}
/**
 * add listeners to the map
 */
function addKnownAreaMapListeners() {
    if (showLogs) console.log('add listeners');
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        if (showLogs) console.log('bounds changed');
        searchBox.setBounds(map.getBounds());
    });
}
/**
 * initialises the drawing manager
 */
function initDrawingManager() {
    if (showLogs) console.log('init drawing manager');
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.Circle,
        drawingControl: false,
        circleOptions: circleOptions
    });

    drawingManager.removeCircle = false;
    drawingManager.setMap(map);

    addDrawingManagerListeners();
}
/**
 * adds the listeners to the drawing manager
 */
function addDrawingManagerListeners() {
    if (showLogs) console.log('add drawing manager listeners');
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (circle) {
        if (showLogs) console.log('circlecomplete');
        addCircle(circle);
    });

}
/**
 * adds listeners to the circle
 * @param {google.maps.drawing.OverlayType.Circle} circle for which the listeners should be added
 */
function addCircleListeners(circle) {
    if(showLogs) console.log('add circle listeners');
    //center changed
    google.maps.event.addListener(circle, 'center_changed', function (event) {
        if (showLogs) console.log('circle center changed, lat: ' + circle.center.lat() + ' , lng: ' + circle.center.lng());
    });
    //radius changed
    google.maps.event.addListener(circle, 'radius_changed', function (event) {
        if (showLogs) console.log('circle radius changed: ' + circle.radius);
    });
    //click
    google.maps.event.addListener(circle, 'click', function (event) {
        if (showLogs) console.log('circle click, id: ' + circle.id);
        if (drawingManager.removeCircle) {
            removeCircle(circle);
        }
    });

}
/**
 * adds a circle
 * @param {google.maps.drawing.OverlayType.Circle} circle to add
 */
function addCircle(circle) {
    circle.id = circleCounter++;
    if (showLogs) console.log('add circle, id: ' + circle.id);
    circles.push(circle);
    addCircleListeners(circle);
}
/**
 * removes a circle
 * @param {google.maps.drawing.OverlayType.Circle} circle
 */
function removeCircle(circle) {
    if (showLogs) console.log('removing circle, ' + circle.id);

    google.maps.event.clearListeners(circle, 'center_changed');
    google.maps.event.clearListeners(circle, 'radius_changed');
    circle.setRadius(0);

    circle.setMap(null);

    circles = jQuery.grep(circles, function (value) {
        return value.id != circle.id;
    });
}
/**
 * initialises the search box
 */
function initSearchBox(){
    if (showLogs) console.log('init search box');
    var sb = $("#sb_places")[0];
    searchBox = new google.maps.places.SearchBox(sb);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(sb);
    
    addSearchBoxListeners();
}
/**
 * adds the listeners to the search box
 */
function addSearchBoxListeners(){
    if (showLogs) console.log('add search box listeners');
    // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        
        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

/**
 * gets all the circles set by the user or null
 * @returns {Array|circles} the array of circles or null
 */
function getCircles(){
    if(showLogs) console.log('get circles');
    if(circles.length > 0){
        return circles;
    }else{
        return null;
    }
}
/**
 * gets the number of all circles set by the user
 * @returns {Number} number of circles
 */
function getNumberOfCircles(){
    if(showLogs) console.log('get number of circles');
    var n = getCircles();
    return (n == null || n == 'undefined') ? 0 : n.length;
}
/**
 * loads the existing circles and displays them on the map
 */
function loadExistingCircles(){
    if(showLogs) console.log('load existing circles');
    if(existingCircles == null){
        if(showLogs) console.log('no existing circles');
    }else{
        if(existingCircles.length > 0){
            //guide comes from guide site, he can go back
            //show back button
            backArrow.show();

            if(showLogs) console.log('number of existing circles: ' + existingCircles.length);
            //set properties for each circle
            $.each(existingCircles, function (index, value) {
                var c = new google.maps.Circle({
                    center: {lat: value.lat, lng: value.lng},
                    radius: value.radius,
                    fillColor: circleOptions.fillColor,
                    fillOpacity: circleOptions.fillOpacity,
                    strokeWeight: circleOptions.strokeWeight,
                    clickable: circleOptions.clickable,
                    editable: circleOptions.editable,
                    zIndex: circleOptions.zIndex,
                    suppressUndo: circleOptions.suppressUndo,
                    strokeColor: circleOptions.strokeColor,
                    map: map
                });
                //display circle on map and add listeners
                addCircle(c);
            });
        }else{
            if(showLogs) console.log('less than 1 existing circle');
        }
    }
}
/**
 * prepares the circles to be saved to the server and sends them
 */
function saveCircles(){
    if(showLogs) console.log('save circles');
    if(getNumberOfCircles() > 0){
        var ec = [];
        $.each(circles, function (index, value) {
            var circle = {
                radius: value.radius,
                lat: value.center.lat(),
                lng: value.center.lng()
            };
            ec.push(circle);
            removeCircle(value);
        });
        existingCircles = JSON.stringify(ec);
        submitCircles();
    }else{
        if(showLogs) console.log('no circles to save');
        //prevent form from being submitted
        return false;
    }
}
/**
 * sends the saved circles to the server
 */
function submitCircles(){
    // Create the form object
    var areaForm = document.createElement("form");
    areaForm.setAttribute("method", "post");
    areaForm.setAttribute("action", "/guideAreas");
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "areas");
    hiddenField.setAttribute("value", existingCircles);
    // append the newly created control to the form
    areaForm.appendChild(hiddenField);
    document.body.appendChild(areaForm); // inject the form object into the body section
    areaForm.submit();
}
     