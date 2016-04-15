//var express = require('express');

var router = express.Router();

//express.use(session(sessionOptions));

/* GET users listing. */
router.get('/', function(req, res, next) {

	if ( !req.session.username){
		res.send('No session!!!');
	}else{
		res.render('user', { username: req.session.username});
		
	}
	
  //res.send('respond with a resource');
});

module.exports = router;
