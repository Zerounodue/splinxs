var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
//var Account = require('../models/account');
var Guide = require('../models/guide');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


/* GET home page. */
router.get('/', function(req, res, next) {
    if(func.isGuide(req)){
        if(func.isLoggedIn(req)){
            func.renderGuide(res);
            return;
        }else{
            func.logout(res);
            //Do NOT add return statement here!!
        }
    }
    res.render('index');
});

router.get('/touristLocalisation', function(req, res) {
    res.render('touristLocalisation');
});

router.get('/db', function(req, res) {
    /*
    Guide.register(new Guide({ username : 'Mike' }), '123', function(err, guide) {
        if (err) {
            console.log('authentication failed');
        }

        passport.authenticate('local')(req, res, function () {
            
            console.log('okee');
        });
    });
    */
    var id = "570cddce83743d7c114a7e42";
    //Guide.update({ _id: id }, { $set: { languages: ['en', 'de'], areas: [{lat: 46.947248, lng: 7.451586, radius: 100}] }}, callback);
    
    //Guide.update({ _id: id }, { $set: { areas: [{lat: 46.947248, lng: 46.947248, radius: 100}] } }, callback);
    
    //Guide.findByIdAndRemove({ _id: id }, callback);
    
    
    Guide.findOne({ '_id': id }, 'areas', function (err, guide) {
        //error occured
        if (err) return handleError(err);
        var a = guide.isInArea({lat: 46.947248, lng: 7.451586});
        console.log('-------------is in area: ' + a);
        
        a = guide.isInArea({lat: 55.947248, lng: 15.451586});
        console.log('-------------is in area: ' + a);
    });
    
    
    
    function callback(){
        Guide.find(function(err, guides){
            console.log(guides);
            res.send('<a>' + guides + '</a>');
        });
    }

    //res.render('knownAreas', {dbAreas: areas});
});



router.get('/touristSettings', function(req, res) {
    res.render('touristSettings');
});


router.get('/guideSocket', function(req, res) {
    res.render('guideSocket', {session: req.session});
});


router.get('/index', function(req, res) {
    //TODO is this good?
    if(func.isGuide(req) && func.isLoggedIn(req)){
        func.renderGuide(res);
        return;
    }
    res.render('index');
});


router.get('/index2', function(req, res) {
    res.render('index2');
});

router.post('/index', function (req, res, next) {

    passport.authenticate('local', function (err, guide, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        //password username combination not found
        if (!guide) {
            //TODO title not needed?
            res.render('index', {title: "__Login", loginError: "__wrong username or password", username:req.body.username});
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
                    //TODO might need to do something more?
                    return handleError(err);
                }
                //TODO error occurred  when testing:
                // if(guide.languages)      {TypeError: Cannot read property 'languages' of null
                //cannot reproduce
                if(guide.languages){
                    hasLanguages = guide.languages.length > 0;
                }
                if(guide.areas){
                    hasAreas = guide.areas.length > 0;
                }
                //TODO delete when tested
                //console.log("has langs: " + hasLanguages + ", has areas: " + hasAreas);
                
                callback();
                
            });
            
        });
        //callback when db query completed
        function callback(){
            req.session.username = req.body.username;
            req.session.guide = true;
            req.session.loggedIn = false;
            
            //guide completed registration
            if (hasLanguages && hasAreas) {;
                req.session.loggedIn = true;
                func.renderGuide(res);
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




module.exports = router;