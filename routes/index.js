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
//functions used in all routes
var func = require('../public/resources/js/functions.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    if(func.isGuide(req)){
        if(func.isLoggedIn(req)){
            func.redirectGuide(res);
            return;
        }else{
            func.logout(res);
            //Do NOT add return statement here!!
        }
    }
    res.render('index', {title: "Splinxs"});
});

router.get('/index', function(req, res) {
    if(func.isGuide(req) && func.isLoggedIn(req)){
        func.redirectGuide(res);
        return;
    }
    res.render('index', {title: "Splinxs"});
});

router.post('/index', function (req, res, next) {

    passport.authenticate('local', function (err, guide, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        //password username combination not found
        if (!guide) {
            res.render('index', {title: "Login", loginError: "ERROR_MESSAGE", username:req.body.username});
            return;
        }

        var name = req.body.username;
        //check in db if guide has already set languages and areas
        var hasLanguages = false;
        var hasAreas = false;
        
        req.login(guide, function (err) {
            if (err) {
                return next(err);
            }
            Guide.findOne({'username': name}, 'languages areas', function (err, guide) {
                //error occured
                if (err){
                    return handleError(err);
                }
                if(guide.languages){
                    hasLanguages = guide.languages.length > 0;
                }
                if(guide.areas){
                    hasAreas = guide.areas.length > 0;
                }
                callback();
            });
        });
        //callback when db query completed
        function callback(){
            if (guideList.indexOf(req.body.username) > -1){
                func.redirectHome(res);
                return;
            }
            
            guideList.push(req.body.username);
            
            req.session.username = req.body.username;
            req.session.guide = true;
            req.session.loggedIn = false;
            
            //guide completed registration
            if (hasLanguages && hasAreas) {;
                req.session.loggedIn = true;
                //func.renderGuide(res);
                func.redirectGuide(res);
                return;
            //guide needs to add areas
            } else if(hasLanguages) {
                req.session.hasLanguages = true;
                req.session.hasAreas = false;
                func.renderGuideAreas(res);
                return;
            //guide needs to add languages
            }else if(hasAreas){
                req.session.hasLanguages = false;
                req.session.hasAreas = true;
                func.renderGuideLangs(res);
                return;
            //guide needs to add languages and areas
            }else{
                req.session.hasLanguages = req.session.hasAreas = false;
                func.renderGuideLangs(res);
                return;
            }
        }
    })(req, res, next);
});

router.get('/beta', function(req, res) {

    res.render('beta', {title: "beta"});
});

module.exports = router;