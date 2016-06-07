/**
 * Created by Zerododici on 10.05.16.
 */


var reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var showLogs=true;
var animDur=400;

var log;
var el;
//var START_X = Math.round((window.innerWidth - el.offsetWidth) / 2);
//var START_Y = Math.round((window.innerHeight - el.offsetHeight) / 2);
//var START_X = Math.round((0+ el.offsetWidth) / 2);
//var START_Y = Math.round((0+ el.offsetHeight) / 2);
var START_X=0;
var START_Y=0;

var ticking = false;
var transform;

var mc;

transform = {
    //translate: { x: START_X, y: START_Y },
    translate: { x: START_X, y: START_Y}

};

$(document).ready(function () {
    log = document.querySelector("#log");
    el = document.querySelector("#hammerdrag");
    //the hammerJS element must be insite this DOM element.
    //the hammerJS element can't be dragged outside this element
    hammerContainer = document.querySelector("#hammerContainer");


    mc= new Hammer.Manager(el);
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

    mc.on("panstart panmove", onPan);


    mc.on("hammer.input", function(ev) {

        if(ev.isFinal) {
            START_X= START_X+ev.deltaX;
            START_Y= START_Y+ev.deltaY;
            //resetElement();
            checkPos();
        }

    });
    $("#videoSettings").on('click', function(e){
        if(showLogs) console.log('videoSettings  button clicked');
        $('.navbar-collapse').collapse('hide');
        $("#hammerSettings").show(animDur);
    });


    $("#btn_hammerClose").on('click', function(e){
        if(showLogs) console.log('hammer close button clicked');

        $("#hammerSettings").hide(animDur);
    });
    $("#img_loadClose").on('click', function(e){
        if(showLogs) console.log('hammer close button clicked');

        $("#hammerSettings").hide(animDur);
    });



    $("#opacityRange").on("input change", function() {


        var alpha = $(this).val()/100;
        console.log(alpha);
        /*
        $("#hammerdrag").css('background-color', 'rgba(255,255,255,' + alpha + ')');​
        */

        $( "#hammerdrag" ).fadeTo( "fast" , alpha);

        //$("#hammerdrag").css("background-color", hex2rgba("#ABCDEF", 0.6));
        //$("#hammerdrag").opacity ($("#opacityRange").val()/100);
    });

    $("#sizeRange").on("input change", function() {
        size=$("#sizeRange").val()*5 +10;
        console.log(size);
        if( size > $(hammerContainer).width() || size > $(hammerContainer).height()){
            if($(hammerContainer).width()<$(hammerContainer).height()){
                size = $(hammerContainer).width();
            }
            else{
                size= $(hammerContainer).height();
            }
            console.log("???");
        }
        checkPos();
        $("#hammerdrag").width( size);
        $("#hammerdrag").height(size );
    });

});
$( window ).resize(checkPos);

function checkPos () {
    var position = $('#hammerdrag').position();
    if(showLogs)console.log('element X: ' + position.left + ", elemnt Y: " + position.top );
    var changes = false;
    if(position.top < $(hammerContainer).position().top){START_Y=0; changes=true;}
    if(position.left < $(hammerContainer).position().left){START_X=0;changes=true;}
    if(position.left+el.offsetWidth > $(hammerContainer).width() +$(hammerContainer).position().left){START_X=$(hammerContainer).width()-el.offsetWidth;changes=true;}
    if(position.top +el.offsetHeight > $(hammerContainer).height()+ $(hammerContainer).position().top){START_Y=$(hammerContainer).height()-el.offsetHeight;changes=true;}
    if(showLogs)console.log("hey"+(position.top +el.offsetHeight));

    if (changes){
        el.className = 'animate';
        transform = {
            //translate: { x: START_X, y: START_Y },
            translate: { x: START_X, y: START_Y}

        };
        requestElementUpdate();
    }
}


function updateElementTransform() {

    var value = [
        'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'
    ];

    value = value.join(" ");
    el.textContent = value;
    el.style.webkitTransform = value;
    el.style.mozTransform = value;
    el.style.transform = value;
    ticking = false;

}

function requestElementUpdate() {
    if(!ticking) {
        reqAnimationFrame(updateElementTransform);
        //updateElementTransform();
        ticking = true;
    }
}



function onPan(ev) {
    if(showLogs) console.log(ev.deltaX);
    el.className = '';
    transform.translate = {


        x: START_X + ev.deltaX,
        y: START_Y + ev.deltaY

    };
    requestElementUpdate();
}



var defaultLocation = {lat: 0, lng: 0};
function initMap(){
    if(showLogs) console.log('init map');
    map = new google.maps.Map(document.getElementById('hammerContainer'), {
        center: defaultLocation,
        zoom: 3,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false
    });

}
 