var express = require('express');
var router = express.Router();

//only for guide!?
//var passport = require('passport');
//var Account = require('../models/account');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


router.get('/touristLanguages', function(req, res) {
    if(func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    req.session.username = func.createTouristUsername();
    func.renderTouristLanguages(res);
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
    
    for (var i = 0; i <  langs.length; i++){
        if(!ISO6391.validate(langs[i].code)){
            validLangs = false;
            break;
        }
    }

    if(validLangs){
        req.session.languages = langs;
        //send to tourist location
        func.renderTouristLocation(res);
    }else{
        //invalid language(s)
        redirectHome(res);
    }

});

router.get('/touristLocation', function(req, res) {
    /*
    if(!func.hasSession(req) || func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    if(!func.touristHasLanguages(req)){
        func.renderTouristLanguages(res);
        return;
    }
    */
    
    func.renderTouristLocation(res);
    return;
});

router.post('/touristLocation', function(req, res) {
    /*
    if(!func.hasSession(req) || ){
        func.redirectHome(res);
        return;
    }
    */
    if (!req.body || !req.body.position){
        redirectHome(res);
        return;
    }
    var pos = JSON.parse(req.body.position);

    var validLocation = pos.lat != null && pos.lng != null && func.isNumeric(pos.lat) && func.isNumeric(pos.lng);
    
    if(validLocation){
        req.session.lat = pos.lat;
        req.session.lng = pos.lng;
        
        //did not set languages
        if(!func.touristHasLanguages(req)){
            func.redirectHome(res);
            return;
        }
        
        //tourist site
        func.renderTouristSite(res, req.session.username);
        return;
    }else{
        func.redirectHome(res);
        return;
    }

});


router.get('/touristLocalisation', function(req, res) {
    res.render('touristLocalisation');
});



router.post('/tourist', function(req, res) {
    if(!func.hasSession(req) || func.isLoggedIn(req) || func.isGuide(req) || !func.touristHasLanguages(req) || !func.tourustHasAreas(req)){
        func.redirectHome(res);
        return;
    }

    if (!req.body){ //|| !req.body.parameter){
        console.log(req.body);
        //TODO redirect somewhere
        res.send('<a>no post params, cheater!!!</a>');
        return;

    }

    var params ="this are my parameters";
    //var params = JSON.parse(req.body.parameter);


    //if(params.languages.lenght <1 ){//TODO redirect somewhere

    //    res.send('<a>no languages.lenght, cheater!!!</a>');
    //}

    //TODO thigns
    req.session.params = params;


    //TODO chech that req.body.position is ok
    req.session.position=req.body.position;
    //console.log(3);
    console.log("Recived params "+ req.body.position);
    res.send("Tourist site, recived position: "+ req.body.position);
    //res.render('tourist', {session: req.session});


});

/*
router.get('/tourist', function(req, res) {
    //needs to be a logged in  guide
    if(!func.hasSession(req) || func.isLoggedIn(req) || func.isGuide(req) || !func.touristHasLanguages(req)){//TODO check for location
        func.redirectHome(res);
        return;
    }
    func.renderTourist(res);
    return;
});
*/

module.exports = router;