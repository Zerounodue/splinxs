/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

var express = require('express');
var router = express.Router();

var GuideLanguage = require('../models/guideLanguage');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


router.get('/touristLanguages', function(req, res) {
    //TODO is this intelligent? can't a guide do tourist things?
    //do an automatic logout or tell the guide he has to logout
    // hard redirect is not user friendly

    //1. there is no link for the guide to go to this website, if he does, then he has to enter the url himself
    //-> he does something that is not "allowed" thus it does not have to be user friendly
    //2. it just makes no sense at all that a guide does tourist things, a guide is there to help, when he wants to get help, he becomes a tourist...
    //-> he can log out and use the link to go to the tourit site, which is "allowed"
    if(func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    
    GuideLanguage.findOne({}, 'codes', {lean: true}, function (err, langs){
        if (err) {
            console.log('error getting guide languages: ' + err);
            return handleError(err);
        }
        req.session.username = func.createTouristUsername();
        func.renderTouristLanguages(res, langs.codes.sort());
    });

});

router.post('/touristLanguages', function(req, res) {
    if(!func.hasSession(req) || func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    if (!req.body || !req.body.languages){
        func.redirectHome(res);
        return;
    }
    var langs = JSON.parse(req.body.languages);
    var validLangs = true;
    
    var codes = [];
    
    for (var i = 0; i <  langs.length; i++){
        if(!ISO6391.validate(langs[i].code)){
            validLangs = false;
            break;
        }else{
            codes.push(langs[i].code);
        }
    }

    if(validLangs){
        req.session.languages = codes;
        //send to tourist location
        func.renderTouristLocation(res);
    }else{
        //invalid language(s)
        redirectHome(res);
    }

});

router.get('/touristLocation', function(req, res) {
    if(!func.hasSession(req) || func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    if(!func.touristHasLanguages(req)){
        func.renderTouristLanguages(res);
        return;
    }
    func.renderTouristLocation(res);
    return;
});

//not allowed to go here with a get request
router.get('/tourist', function(req, res) {
    func.redirectHome(res);
});

router.post('/tourist', function(req, res) {
    if(!func.hasSession(req) || func.isGuide(req) || !func.touristHasLanguages(req) || !func.touristHasUsername(req)){
        func.redirectHome(res);
        return;
    }
    if (!req.body || !req.body.position){
        redirectHome(res);
        return;
    }
    
    var pos = JSON.parse(req.body.position);
    var validLocation = func.isNumeric(pos.lat) && func.isNumeric(pos.lng);

    if(validLocation){
        req.session.lat = pos.lat;
        req.session.lng = pos.lng;
        
        //did not set languages
        if(!func.touristHasLanguages(req)){
            func.redirectHome(res);
            return;
        }
        
        //tourist site
        func.renderTouristSite(res);
        return;
    }else{
        func.redirectHome(res);
        return;
    }
});


module.exports = router;