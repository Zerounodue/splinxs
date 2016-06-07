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
 * hammerFunction.js
 * contains functions related with the ui on the guide & tourist sites
 * is used to move the video div around, works on desktop PCs and touch devices
 * used by guides & tourists
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
var START_X=0;
var START_Y=0;

var ticking = false;
var transform;

var mc;
var hammerDraggable= "#hammerVideo"

transform = {
    translate: { x: START_X, y: START_Y}

};

$(document).ready(function () {
    log = document.querySelector("#log");
    el = document.querySelector(hammerDraggable);
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
            checkPos();
        }

    });

});
$( window ).resize(checkPos);

function checkPos () {
    var position = $(hammerDraggable).position();
    var changes = false;
    if(position.top < $(hammerContainer).position().top){START_Y=0; changes=true;}
    if(position.left < $(hammerContainer).position().left){START_X=0;changes=true;}
    if(position.left+el.offsetWidth > $(hammerContainer).width() +$(hammerContainer).position().left){START_X=$(hammerContainer).width()-el.offsetWidth;changes=true;}
    if(position.top +el.offsetHeight > $(hammerContainer).height()+ $(hammerContainer).position().top){START_Y=$(hammerContainer).height()-el.offsetHeight;changes=true;}
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
    el.style.webkitTransform = value;
    el.style.mozTransform = value;
    el.style.transform = value;
    ticking = false;
}

function requestElementUpdate() {
    if(!ticking) {
        reqAnimationFrame(updateElementTransform);
        ticking = true;
    }
}

function onPan(ev) {
    el.className = '';
    transform.translate = {
        x: START_X + ev.deltaX,
        y: START_Y + ev.deltaY

    };
    requestElementUpdate();
}

