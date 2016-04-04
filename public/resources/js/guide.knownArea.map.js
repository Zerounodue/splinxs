/**
 * guide.knownArea.map.js
 * contains functions for marking certain regions on the map
 * used by guides
 */

//variables
var showLogs = true;
var map;
var drawingManager;
var searchBox;
var drawingModes;
var circles = [];
var circleCounter = 0;
var defaultLocation = {lat: 46.947248, lng: 7.451586}; //Bern


/**
 * callback when the map script has been successfully loaded
 */
function initKnownAreaMap() {
    if (showLogs) console.log('initialising known areas map');
    map = new google.maps.Map($("#map")[0],{
        center: defaultLocation,
        zoom: 10,
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
        /*
         drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.CIRCLE
            ]
         },
         */
        circleOptions: {
            fillColor: '#28B294',
            fillOpacity: 0.6,
            strokeWeight: 2,
            clickable: true,
            editable: true,
            zIndex: 1,
            suppressUndo: true,
            strokeColor: '#2585C4'
        }
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
        var radius = circle.getRadius();
        if (showLogs) console.log('circlecomplete');
        addCircleListeners(circle);
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
/* might be needed if map does show gray
function resizeMap() {
    google.maps.event.trigger(map, 'resize');
    map.setZoom(map.getZoom());
}
*/

$(document).ready(function () {
    if (showLogs) console.log('document ready');
    
    $("#btn_knownAreasContinue").click(function (e) {
        if(showLogs) console.log('knownAreasContinue button clicked');
        alert('No circles: ' + getNumberOfCircles());
    });
    
    $("#mapControlPan").click(function () {
        if(showLogs) console.log('mapControlsPan clicked');
        drawingManager.setDrawingMode(drawingModes.pan);
        drawingManager.removeCircle = false;
    });

    $("#mapControlAddCircles").click(function () {
        if(showLogs) console.log('mapControlAddCircles clicked');
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        drawingManager.removeCircle = false;
    });

    $("#mapControlRemoveCircles").click(function () {
        if(showLogs) console.log('mapControlRemoveCircles clicked');
        drawingManager.setDrawingMode(null);
        drawingManager.removeCircle = true;
    });

});
/**
 * gets all the circles set by the user or null
 * @returns {Array|circles} the array of circles or null
 */
function getCircles(){
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
    var n = getCircles();
    
    return n == null ? 0 : n.length;
}