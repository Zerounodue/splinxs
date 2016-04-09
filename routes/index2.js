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
    console.log('-----lang get -----');
    res.render('chooseLanguages', {langs: ISO6391});
});

router.post('/lang', function(req, res) {
    console.log('-----lang post -----');
    var b = req.body;
    var c = b.languages;
    var d = JSON.parse(c);
    console.log(req.body);
    var a = req.params;
    debugger;
    res.redirect('/');
});





module.exports = router;