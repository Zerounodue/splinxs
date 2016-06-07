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

//mongodb stuff
var passport = require('passport');
var Guide = require('../models/guide');
var GuideLanguage = require('../models/guideLanguage');
//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');
//https://www.npmjs.com/package/email-validator
var emailValidator = require("email-validator");
//functions used in all routes
var func = require('../public/resources/js/functions.js');

router.get('/register', function(req, res) {
    res.render('index', {title: "Register"});
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
    //this must be done the first time or create the collection by hand
    /*
    GuideLanguage.create({ codes: ['en'] }, function (err, small) {
        if (err) return handleError(err);
        // saved!
    })
    */

    Guide.register(new Guide({ username : req.body.username, email: req.body.email }), req.body.password, function(err, guide) {
        if (err) {
            //username already exists
            if(err.name == "UserExistsError"){
                res.render('index', {title: "Register", registerError: "USERNAME_TAKEN", email: email});
                return;
            }
            //duplicate key -> email
            if(err.code == 11000){
                res.render('index', {title: "Register", registerError: "EMAIL_TAKEN", username: name});
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
    func.logout(res);
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
    //check if code is ISO-6391, in case there are evil users...
    for (var i = 0; i <  langs.length; i++){
        if(!ISO6391.validate(langs[i])){
            validLangs = false;
            break;
        }
    }
    if(validLangs){
        //save to db
        Guide.update({ username: req.session.username }, { $set: { languages: langs } },  function (err, raw){
            if(err){
                return handleError(err);
            }
        });
        //save languages in list of all languages that guides can speak
        GuideLanguage.update(null, {$addToSet: {codes: {$each: langs}}}, function (err, raw){
            if(err){
                return handleError(err);
            }
        });
        if(func.isLoggedIn(req)){
            //send to guide site (when logged in it redirects to guide)
            func.redirectHome(res);
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
        func.redirectHome(res);
        return;
    }
    //no post params
    if (!req.body || !req.body.areas){
        func.redirectHome(res);
        return;
    }    

    var areas = JSON.parse(req.body.areas);
    var validAreas = true;
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
                return handleError(err);
            }
        });
        
        if(func.isLoggedIn(req)){
            //send to guide site
            func.redirectGuide(res);
            return;
        }else{
            req.session.hasAreas = true;
            if(!func.hasLanguages(req)){
                //send to choose area
                func.renderGuideLanguages(res, req.session.username);
                return;
            }else{
                //send home that guide can login
                res.render('index', {title: "Login", registrationOK: "TRUE"});
                func.redirectHome(res);
                return;
            }
        }
    }else{
        //not possible
        func.redirectHome(res);
        return;
    }

});

router.get('/guidePassword', function(req, res) {
    func.renderGuidePW(res);
    return;
});

router.post('/guidePassword', function(req, res) {
    //needs to be a logged in guide
    if(!func.hasSession(req) || !func.isLoggedIn(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    //no post params
    if (!req.body || !req.body.password){
        func.redirectHome(res);
        return;
    }
});

router.get('/guide', function(req, res) {
    //needs to be a logged in guide
    if(!func.hasSession(req) || !func.isLoggedIn(req) || !func.isGuide(req)){
        func.redirectHome(res);
        return;
    }
    func.renderGuide(res);
    return;
});

module.exports = router;