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
        //send to choose location
        //TODO implement
    }else{
        //not possible
        redirectHome(res);
    }

});

module.exports = router;