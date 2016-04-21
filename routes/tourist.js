var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


router.get('/touristLanguages', function(req, res) {
    /*
    if(!func.hasSession(req)){
        func.redirectHome(res);
        return;
    }
    */
    res.render('touristLanguages', {title: "__Choose Tourist Languages", langs: ISO6391});
});

router.post('/touristLanguages', function(req, res) {
    /*
    if(!func.hasSession(req)){
        func.redirectHome(res);
        return;
    }
    */
    if (!req.body || !req.body.languages){
        func.redirectHome(res);
        return;
    }
    var langs = JSON.parse(req.body.languages);
    var validLangs = true;
    
    for (var i = 0; i <  langs.length; i++){
        console.log('code: ' + langs[i].code);
        if(!ISO6391.validate(langs[i].code)){
            validLangs = false;
            break;
        }
    }

    if(validLangs){
        //TODO save in session
        //
        //send to choose location
        res.render('touristLocation', {title: '__Tourist Location'});
    }else{
        //invalid language(s)
        redirectHome(res);
    }

});

router.get('/touristLocation', function(req, res) {
    /*
    if(!func.hasSession(req)){
        func.redirectHome(res);
        return;
    }
    */
    res.render('touristLocation');
});

router.post('/touristLocation', function(req, res) {
    /*
    if(!func.hasSession(req)){
        func.redirectHome(res);
        return;
    }
    */
    if (!req.body || !req.body.position){
        redirectHome(res);
    }
    var position = JSON.parse(req.body.position);

    var validLocation = position.lat != null && position.lng != null;
    
    if(validLocation){
        //TODO save in session
        
        //tourist site
        //TODO implement
    }else{
        redirectHome(res);
    }

});

router.get('/touristLocalisation', function(req, res) {
    res.render('touristLocalisation');
});



router.post('/tourist', function(req, res) {
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
    if(!req.session){
        req.session.guid = generadeID();
    }
    req.session.params = params;


    //TODO chech that req.body.position is ok
    req.session.position=req.body.position;
    //console.log(3);
    console.log("Recived params "+ req.body.position);
    res.send("Tourist site, recived position: "+ req.body.position);
    //res.render('tourist', {session: req.session});


});


module.exports = router;