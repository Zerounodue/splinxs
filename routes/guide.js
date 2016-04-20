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



router.get('/login', function(req, res) {
    res.render('login', { title: "__Login" });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, guide, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        //password username combination not found
        if (!guide) {
            res.render('login', {title: "__Login", error: "__wrong username or password"});
            return;
        }

        req.login(guide, function (err) {
            if (err) {
                return next(err);
            }

            var name = req.body.username;
            //check in db if guide entered languages and areas
            var hasLanguagesAreas = false;
            Guide.findOne({'username': name}, 'areas, languages', function (err, guide) {
                //error occured
                if (err)
                    return handleError(err);

                hasLanguagesAreas = guide.hasLanguagesAreas();
                //TODO delete when tested
                console.log('-------------is in HAS: ' + hasLanguagesAreas);
            });

            //guide needs to add languages annd/or areas
            if (hasLanguagesAreas) {
                req.session.complete = true;
                req.session.username = req.body.username;
                req.session.guide = true;
                req.session.loggedIn = true;
                res.render('guide', {title: "__Guide"});
                return;
            } else {
                req.session.complete = false;
                req.session.username = req.body.username;
                req.session.guide = true;
                req.session.loggedIn = false;
                renderChooseLangs(res);
                return;
            }

        });
    })(req, res, next);
});


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
            func.renderChooseLangs(res);
            return;
        });
    });

});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/allUsers', function(req, res){
    Account.find(function(err, accounts){
        console.log(accounts);
        res.render('allUsers',{title : 'All users', users : accounts});
    });
});





module.exports = router;

