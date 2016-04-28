var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
//var Account = require('../models/account');
var Guide = require('../models/guide');
var GuideLanguage = require('../models/guideLanguage');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');
//https://www.npmjs.com/package/email-validator
var emailValidator = require("email-validator");

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


router.get('/register', function(req, res) {
    res.render('index', {title: "__Register"});
});

router.post('/register', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email){
        func.redirectHome(res);
        return;
    }
    //check that fields are not empty
    var name = req.body.username;
    var pw = req.body.password;
    var pw2 = req.body.password_confirm;
    var email = req.body.email;
    if(!func.usableString(name) || !func.usableString(pw) || !func.usableString(pw2) || !func.usableString(email)){
        func.redirectHome(res);
        return;
    }
    //passwords must match
    if(pw != pw2){
        func.redirectHome(res);
        return;
    }
    //valid email
    if(!emailValidator.validate(email)){
        func.redirectHome(res);
        return;
    }
    //TODO this must be done the first time or create the collection by hand
    /*
    var myArr= ['en','de'];

    GuideLanguage.create({ codes: myArr }, function (err, small) {
        if (err) return handleError(err);
        // saved!
    })
    */






    Guide.register(new Guide({ username : req.body.username, email: req.body.email }), req.body.password, function(err, guide) {
        if (err) {
            if(err.name == "UserExisstsError"){
                //TODO title not needed?
                res.render('index', {title: "__Register", registerError: "__username already taken", email: email});
                //TODO remove commented old version line if the above line works
                //res.render('register', {title: "__Register", error: "__username already taken", email: email});
                return;
            }
            func.redirectHome(res);
            return;
        }

        passport.authenticate('local')(req, res, function () {
            //created successfully
            req.session.username = name;
            req.session.guide = true;
            req.session.loggedIn = false;
            req.session.hasLanguages = req.session.hasAreas = false;
            func.renderGuideLangs(res);
            return;
        });
    });

});

router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy(function (err) {
        if (err) {
            console.log("logout error: " + err);
            return next(err);
        }
    });
    res.redirect('/');
});


router.get('/guideLanguages', function(req, res) {
    //needs to be a guide
    if(!func.hasSession(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    var savedLangs = [];
    //guide wants to change the languages, get them from the db
    if(func.isLoggedIn(req)){
        Guide.findOne({'username': req.session.username}, 'languages', {lean: true}, function (err, guide) {
            //error occured
            if (err) {
                //TODO might need to do something more?
                return handleError(err);
            }
            if (guide.languages && guide.languages.length > 0) {
                savedLangs = guide.languages;
            }
            func.renderGuideLangs(res, savedLangs);
            return;
        });
    }else{
        if(func.hasLanguages(req)){
            func.redirectHome(res);
            return;
        }
        func.renderGuideLangs(res);
        return;
    }
});

router.post('/guideLanguages', function(req, res) {
    //needs to be a guide
    if(!func.hasSession(req) || !func.isGuide(req)){
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
        //TODO delete
        if(!ISO6391.validate(langs[i])){
            validLangs = false;
            break;
        }
    }

    if(validLangs){
        //save to db
        Guide.update({ username: req.session.username }, { $set: { languages: langs } },  function (err, raw){
            if(err){
                //TODO might need to do something more?
                return handleError(err);
            }
        });
        //TODO make work
        GuideLanguage.update(null, {$addToSet: {codes: {$each: langs}}}, function (err, raw){
            if(err){
                console.log("GuideLanguage update error");
                //TODO might need to do something more?
                return handleError(err);
            }
            else{
                console.log("GuideLanguage all ok?");
            }
        });




        if(func.isLoggedIn(req)){
            //send to guide site
            func.renderGuide(res, req.session.username);
            return;
        }else{
            req.session.hasLanguages = true;
            if(!func.hasAreas(req)){
                //send to choose area
                func.renderGuideAreas(res);
                return;
            }else{
                //send home that guide can login
                func.redirectHome(res);
            }
        }
    }else{
        //not possible
        func.redirectHome(res);
        return;
    }

});

router.get('/guideAreas', function(req, res) {
    //needs to be a guide
    if(!func.hasSession(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    var savedAreas = [];

    //guide wants to change the areas, get them from the db
    if(func.isLoggedIn(req)){
        Guide.findOne({'username': req.session.username}, 'areas', {lean: true}, function (err, guide) {
            //error occured
            if (err) {
                //TODO might need to do something more?
                return handleError(err);
            }
            if (guide.areas && guide.areas.length > 0) {
                savedAreas = guide.areas;
            }
            func.renderGuideAreas(res, savedAreas);
            return;
        });
    }else{
        if(func.hasAreas(req)){
            func.redirectHome(res);
            return;
        }
        func.renderGuideAreas(res);
        return;
    }
});

router.post('/guideAreas', function(req, res) {
    //needs to be a guide
    if(!func.hasSession(req) || !func.isGuide(req)){
        //TODO remove console.log
        console.log("no session or is no guide --> redirect home");
        func.redirectHome(res);
        return;
    }
    //no post params
    if (!req.body || !req.body.areas){
        //TODO remove console.log
        console.log("no post paramenter --> redirect home");
        func.redirectHome(res);
        return;
    }    

    var areas = JSON.parse(req.body.areas);
    var validAreas = true;
    //TODO check if works
    if( Object.prototype.toString.call( areas ) === '[object Array]'){
        for (var i = 0; i <  areas.length; i++){
            if(!areas[i].radius || areas[i].radius == null || !areas[i].lat || !areas[i].lng || areas[i].lat == null || areas[i].lng == null){
                validAreas = false;
                break;
            }
            if(areas[i].radius <= 0 || !func.isNumeric(areas[i].lat) || !func.isNumeric(areas[i].lat)){
                validAreas = false;
                break;
            }
        }
    }else{
        validAreas = false;
    }

    if(validAreas){
        //save to db
        Guide.update({ username: req.session.username }, { $set: { areas: areas } },  function (err, raw){
            if(err){
                //TODO remove console.log
                console.log("error in guide.update --> errors");
                //TODO might need to do something more?
                return handleError(err);
            }
        });
        
        if(func.isLoggedIn(req)){
            //TODO remove console.log
            console.log("isLoggedIn --> redirect guide");
            //send to guide site
            func.renderGuide(res, req.session.username);
            return;
        }else{
            req.session.hasAreas = true;
            if(!func.hasLanguages(req)){
                //TODO remove console.log
                console.log("not logged in & has no languages --> redirect guideLanguage");
                //send to choose area
                func.renderGuideLanguages(res, req.session.username);
                return;
            }else{
                //TODO remove console.log
                console.log("not logged in but has languages  --> redirect home so it can login --> all OK");
                //send home that guide can login
                func.redirectHome(res);
            }
        }
    }else{
        //TODO remove console.log
        console.log("impossible! no areas  --> redirect home");
        //not possible
        func.redirectHome(res);
        return;
    }
    
    
    
});

router.get('/guidePassword', function(req, res) {
    //needs to be a logged in  guide
    if(!func.hasSession(req) || !func.isLoggedIn(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    func.renderGuidePW(res);
    return;
});

router.post('/guidePassword', function(req, res) {
    //needs to be a logged in  guide
    if(!func.hasSession(req) || !func.isLoggedIn(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    //no post params
    if (!req.body || !req.body.password){
        func.redirectHome(res);
        return;
    }   
    //TODO implement
    
});

router.get('/guide', function(req, res) {
    //needs to be a logged in  guide
    if(!func.hasSession(req) || !func.isLoggedIn(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    func.renderGuide(res, req.session.username);
    return;
});














module.exports = router;

