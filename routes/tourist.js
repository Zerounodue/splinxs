var express = require('express');
var router = express.Router();

//mongodb stuff
var passport = require('passport');
var Account = require('../models/account');

//https://github.com/meikidd/iso-639-1
var ISO6391 = require('iso-639-1');

//functions used in all routes
var func  = require('../public/resources/js/functions.js');



module.exports = router;