/**
 * Created by Zerododici on 10.05.16.
 */


var reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();



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
});
$( window ).resize(checkPos);

function checkPos () {
    var position = $('#hammerdrag').position();
    console.log('X: ' + position.left + ", Y: " + position.top );
    var changes = false;
    if(position.top < 0){START_Y=0; changes=true;}
    if(position.left <0){START_X=0;changes=true;}
    if(position.left+el.offsetWidth > $(window).width()){START_X=$(window).width()-el.offsetWidth;changes=true;}
    if(position.top +el.offsetHeight > $(window).height()){START_Y=$(window).height()-el.offsetHeight;changes=true;}

    if (changes){
        el.className = 'animate';
        transform = {
            //translate: { x: START_X, y: START_Y },
            translate: { x: START_X, y: START_Y}

        };
        requestElementUpdate();
    }
}
function resetElement() {
    /*
     el.className = 'animate';
     transform = {
     translate: { x: START_X, y: START_Y },
     scale: 1,
     angle: 0,
     rx: 0,
     ry: 0,
     rz: 0
     };



     requestElementUpdate();

     if (log.textContent.length > 2000) {
     log.textContent = log.textContent.substring(0, 2000) + "...";
     }
     */
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

function logEvent(str) {
    //log.insertBefore(document.createTextNode(str +"\n"), log.firstChild);
}

function onPan(ev) {
    console.log(ev.deltaX);
    el.className = '';
    transform.translate = {


        x: START_X + ev.deltaX,
        y: START_Y + ev.deltaY

    };

    requestElementUpdate();
    logEvent(ev.type);
}
