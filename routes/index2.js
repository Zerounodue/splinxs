var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index2', { user : req.user });
});




//mongo db stuff
router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            console.log('authentication fsiled');
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
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








router.get('/lang', function(req, res) {
    res.render('chooseLanguages', {langs: ISO6391});
});

router.post('/lang', function(req, res) {
    
    if (!req.body || !req.body.languages){
        //TODO redirect somewhere
        res.send('<a>no post params, cheater!!!</a>');
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
        res.send('<a>' + JSON.stringify(langs) + '</a>');
    }else{
        res.send('<a>invalid language detected</a>');
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











module.exports = router;