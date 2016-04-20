var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');
var Guide = require('../models/guide');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');
//https://www.npmjs.com/package/email-validator
var emailValidator = require("email-validator");

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


router.get('/register', function(req, res) {
    res.render('register', {title: "__Register"});
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


    Guide.register(new Guide({ username : req.body.username, email: req.body.email }), req.body.password, function(err, guide) {
        if (err) {
            if(err.name == "UserExistsError"){
                res.render('register', {title: "__Register", error: "__username already taken", email: email});
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
            func.renderChooseLangs(res);
            return;
        });
    });

});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
//TODO delete
router.get('/allUsers', function(req, res){
    Account.find(function(err, accounts){
        console.log(accounts);
        res.render('allUsers',{title : 'All users', users : accounts});
    });
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
        Guide.findOne({'username': req.session.username}, 'languages', function (err, guide) {
            //error occured
            if (err) {
                //TODO might need to do something more?
                return handleError(err);
            }
            if (guide.languages && guide.languages.length > 0) {
                savedLangs = guide.languages;
                debugger;
            }
            func.renderChooseLangs(res, savedLangs);
            return;
        });
    }else{
        func.renderChooseLangs(res);
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
        
        if(func.isLoggedIn(req)){
            //send to guide site
            func.renderGuide();
            return;
        }else{
            //send to choose area
            req.session.hasLanguages = true;
            func.renderChooseAreas(res);
            return;
        }
    }else{
        //not possible
        func.redirectHome(res);
        return;
    }

});


















module.exports = router;

