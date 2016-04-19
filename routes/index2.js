var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');
var Guide = require('../models/guide');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');
//var views = 0;

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
        redirectHome(res);
        return;
    }
    //check that fields are not empty
    var name = req.body.username;
    var pw = req.body.password;
    var email = req.body.email;
    if(!usableString(name) || !usableString(pw) || !usableString(email)){
        redirectHome(res);
        return;
    }
    
    //TODO check if email is valid
    var validEmail = true;
    if(!validEmail){
        redirectHome(res);
        return;
    }
    
    
    Guide.register(new Guide({ username : req.body.username, email: req.body.email }), req.body.password, function(err, guide) {
        if (err) {
            if(err.name == "UserExistsError"){
                res.render('register', {title: "__Register", error: "__username already taken"});
                console.log('!!!!!username exists');
                return;
            }
            redirectHome(res);
            return;
        }

        passport.authenticate('local')(req, res, function () {
            //created successfully
            renderChooseLangs(res);
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








router.get('/chooseLanguages', function(req, res) {
    
    if(!hasSession(req)){
        redirectHome(res);
        return;
    }
    renderChooseLangs(res);
});

router.post('/chooseLanguages', function(req, res) {
    if(!hasSession(req)){
        redirectHome(res);
    }
    if (!req.body || !req.body.languages){
        redirectHome(res);
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



function generadeID(){
	return 'GUID';
}







router.get('/guideSocket', function(req, res) {
    res.render('guideSocket', {session: req.session});
});

router.get('/index', function(req, res) {
    res.render('index');
});




router.get('/touristLanguages', function(req, res) {
    res.render('touristLanguages');
});





function isGuide(req){
    var is = false;
    if(req.session){
        if(req.session.guide){
            is = true;
        }
    }
    console.log('     is guide: ' + is);
    return is;
}

function isLoggedIn(req){
    var is = false;
    if(req.session){
        if(req.session.loggedIn){
            is = true;
        }
    }
    console.log('     logged in: ' + is);
    return is;
}

function hasSession(req){
    var has = false;
    if(req.session){
        if(req.session.username){
            has = true;
        }
    }
    console.log('     has session: ' + has);
    return has;
}

function hasCompleteSession(req){
    var has = false;

    if(req.session){
        if(req.session.complete){
            has = true;
        }
    }
    
    console.log('     complete session: ' + has);
    return has;
}

function redirectHome(res){
    res.redirect('/');
}

function renderChooseLangs(res){
    res.render('chooseLanguages', {title: "__Choose Languages", langs: ISO6391});
}

function renderChooseAreas(res){
    res.render('knownAreas', {title: "__Choose Areas"});
}

function usableString(s) {
    var usable = true;
    usable = (s !== null && typeof s === 'string' || s.length > 0);
    return usable;
}

module.exports = router;