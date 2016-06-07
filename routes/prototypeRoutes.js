/*
router.get('/db', function(req, res) {
    
    Guide.register(new Guide({ username : 'Mike' }), '123', function(err, guide) {
        if (err) {
            console.log('authentication failed');
        }

        passport.authenticate('local')(req, res, function () {
            
            console.log('okee');
        });
    });
    
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
*/
/*
router.get('/touristLocalisation', function(req, res) {
    res.render('touristLocalisation');
});
*/
/*
router.get('/touristSettings', function(req, res) {
    res.render('touristSettings');
});
*/
/*router.get('/guideSocket', function(req, res) {
    res.render('guideSocket', {session: req.session});
});
*/
/*
router.get('/hammerJSExample', function(req, res) {
    res.render('hammerJSExample');
});
router.get('/chat', function(req, res) {
    res.render('chat');
});
*/