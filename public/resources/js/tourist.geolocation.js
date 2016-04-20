// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var marker;
var watchID; //used to watchPosition and to clearWatch() --> stop watching position
var navGeoLoc = navigator.geolocation;
var currentPosition=null;
function initMap() {
    var map;
    //center the map automatically
    if (google.loader.ClientLocation != null) {
        map= new google.maps.Map(document.getElementById('map'), {
            center: {lat: google.loader.ClientLocation.latitude, lng: google.loader.ClientLocation.longitude},
            zoom: 8,
            streetViewControl: false
        });
    }
    else{//if aproximate position can't be determined (i.e. with a VPN)
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 0, lng: 0},
            zoom: 3,
            streetViewControl: false
        });
    }
    map.addListener('click', function(e) {
        placeMarkerAndPanTo(e.latLng, map);
    });
        //var infoWindow = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navGeoLoc) {
        $("loadingPopup").show(400);
        //Returns the current position of the user and continues to return updated position as the user moves
        watchID = navGeoLoc.watchPosition(function(position) {
            currentPosition=position;
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude

            };

            $("loadingpopup").hide(400);
            placeMarkerAndPanTo(pos, map);
            //navGeoLoc.clearWatch(watchID);
            //infoWindow.setPosition(pos);
            //infoWindow.setContent('Location found.');
            map.setCenter(pos);
            map.setZoom(15);


        }, function() {
            //an error occurred (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT,UNKNOWN_ERROR)
            noGPSPosition(false);
            //handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        //handleLocationError(false, infoWindow, map.getCenter());
        noGPSPosition(true);
    }
}
function noGPSPosition(notAllowed){
    if (notAllowed) {
        $("nopospopup").show(400);
    }
    else {
        $("loadingpopup").hide(0);
        $("nopospopup").show(0);
    }
}
/*
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}
*/
function placeMarkerAndPanTo(latLng, map) {
    //if there is a marker delete it.
    var firstMarker=false;
    if(marker){
        marker.setMap(null);
    }
    else{firstMarker=true;}
    marker = new google.maps.Marker({
        position: latLng,
        map: map
    });
    map.panTo(latLng);
    if(firstMarker){ //set the zoom to a comfortable level if it's the first
        map.setZoom(15);
    }
}
function sendPosition() {
    if(!marker){
        $("infopopup").show(400);
    }
    else{
        //do some things... save in local storage???
        submitPosition();
    }
}


function submitPosition(){

    var position = JSON.stringify(marker.position);

    // Create the form object
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/tourist");
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "position");
    hiddenField.setAttribute("value", position);
    // append the newly created control to the form
    form.appendChild(hiddenField);
    document.body.appendChild(form); // inject the form object into the body section
    form.submit();

}