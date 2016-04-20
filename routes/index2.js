var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');
var Guide = require('../models/guide');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');


/* GET home page. */
router.get('/', function(req, res, next) {
    //set a session to test
    //req.session.theUsername = "elia";

    //views++;
    //req.session.views=views;
    //console.log("req.session.theUsername= " +req.session.theUsername);
    
    //res.render('index2', { user : req.user });
    res.render('index2');
});





/*
router.get('/chooseLanguages', function(req, res) {
    
    if(!func.hasSession(req)){
        func.redirectHome(res);
        return;
    }
    func.renderChooseLangs(res);
});

router.post('/chooseLanguages', function(req, res) {
    if(!func.hasSession(req)){
        func.redirectHome(res);
    }
    if (!req.body || !req.body.languages){
        func.redirectHome(res);
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
    
    //TODO save to db, connect with guide...
    
    if(validLangs){
        //send to choose area
        
        //res.send('<a>' + JSON.stringify(langs) + '</a>');
    }else{
        //not possible
        redirectHome(res);
    }

});
*/

/*
router.get('/chooseLocation', function(req, res) {
    res.render('chooseLocation');
});

router.post('/chooseLocation', function(req, res) {
    
    if (!req.body || !req.body.position){
        //TODO redirect somewhere
        res.send('<a>no post params, cheater!!!</a>');
    }
    var position = JSON.parse(req.body.position);

    var validLocation = position.lat != null && position.lng != null;
    
    //TODO save to db, connect with guide...
    
    if(validLocation){
        res.send('<a>' + JSON.stringify(position) + '</a>');
    }else{
        res.send('<a>invalid location detected</a>');
    }

});
*/

router.get('/knownAreas', function(req, res) {
    var areas = null; //TODO get from db
    res.render('knownAreas', {dbAreas: areas});
});

router.post('/knownAreas', function(req, res) {
    
    if (!req.body || !req.body.areas){
        //TODO redirect somewhere
        res.send('<a>no post params, cheater!!!</a>');
    }
    var areas = JSON.parse(req.body.areas);
    console.log(areas);
    var validAreas = true;
    
    for (var i = 0; i <  areas.length; i++){
        console.log('radius: ' + areas[i].radius + ' lat: ' + areas[i].center.lat + ' lng: ' + areas[i].center.lng);
        if(areas[i].radius <= 0 || areas[i].center.lat == null || areas[i].center.lng == null){
            validAreas = false;
            break;
        }
    }
    
    //TODO save to db
    
    if(validAreas){
        res.send('<a>' + JSON.stringify(areas) + '</a>');
    }else{
        res.send('<a>invalid area detected</a>');
    }

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
    
   
	if(!req.session){ 
		req.session.guid = generadeID();
		
	}
	req.session.params = params;
	
	console.log(3);
	res.render('tourist', {session: req.session});
        

});









router.get('/guideSocket', function(req, res) {
    res.render('guideSocket', {session: req.session});
});
/*
router.get('/touristLanguages', function(req, res) {
    res.render('touristLanguages', {title: "__Choose Tourist Languages", langs: ISO6391});
});
*/






router.get('/index', function(req, res) {
    res.render('index');
});




router.post('/index', function (req, res, next) {
    passport.authenticate('local', function (err, guide, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        //password username combination not found
        if (!guide) {
            res.render('index', {title: "__Login", error: "__wrong username or password", username:req.body.username});
            return;
        }
        
        var name = req.body.username;
        //check in db if guide entered languages and areas
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
                if(guide.languages){
                    hasLanguages = guide.languages.length > 0;
                }
                if(guide.areas){
                    hasAreas = guide.areas.length > 0;
                }
                //TODO delete when tested
                console.log("has langs: " + hasLanguages + ", has areas: " + hasAreas);
                
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
                func.renderGuide();
                return;
            //guide needs to add areas
            } else if(hasLanguages) {
                req.session.hasLanguages = true;
                req.session.hasAreas = false;
                func.renderChooseAreas(res);
                return;
            //guide needs to add languages
            }else if(hasAreas){
                req.session.hasLanguages = false;
                req.session.hasAreas = true;
                func.renderChooseLangs(res);
                return;
            //guide needs to add languages and areas
            }else{
                req.session.hasLanguages = req.session.hasAreas = false;
                func.renderChooseLangs(res);
                return;
            }
            
            
            
        }
        
    })(req, res, next);
});




module.exports = router;