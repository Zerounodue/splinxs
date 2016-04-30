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

var areaForm;

/**
 * callback when the map script has been successfully loaded
 */
function initMap() {
    if (showLogs) console.log('initialising guide areas map');
    map = new google.maps.Map($("#map")[0],{
        center: defaultLocation,
        zoom: 1,
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
/* might be needed if map shows gray
function resizeMap() {
    google.maps.event.trigger(map, 'resize');
    map.setZoom(map.getZoom());
}
*/

$(document).ready(function () {
    if (showLogs) console.log('guide areas document ready');
    
    areaForm = $("#frm_areas");
    
    $("#btn_knownAreasContinue").click(function (e) {
        if(showLogs) console.log('knownAreasContinue button clicked');
        var n = getNumberOfCircles();
        if(n > 0){
            saveCircles();
        }else{
            //TODO something useful
            alert('__No areas selected...');
        }

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
     