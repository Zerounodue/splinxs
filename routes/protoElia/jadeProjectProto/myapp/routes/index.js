//var express = require('express');

var router = express.Router();





//express.use(session(sessionOptions));

/* GET home page. */
router.get('/', function(req, res, next) {
	req.session.username = "mike";
  res.render('index', { title: 'Splinxs' });
});

module.exports = router;
