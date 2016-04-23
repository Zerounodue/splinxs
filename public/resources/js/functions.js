/**
 * Created by Zerododici on 19.04.16.
 */
var ISO6391 = require('iso-639-1');

this.redirectHome = function(res){
    res.redirect('/');
};

this.renderGuide = function(res, name){
    res.render('guide', {title: '__Guide', name: name});
};

this.renderGuideLangs = function(res, sLangs){
    if(typeof sLangs === 'undefined' || sLangs === null) sLangs = [];
    res.render('guideLanguages', {title: "__Guide Languages", langs: ISO6391, savedLangs: sLangs});
};

this.renderGuideAreas = function(res, sAreas){
    if(typeof sAreas === 'undefined' || sAreas === null) sAreas = [];
    res.render('guideAreas', {title: "__Guide Areas", savedAreas: sAreas});
};

this.renderGuidePW = function(res){
    res.render('guidePassword', {title: "__Guide Password"});
};

//function usableString(s) {
this.usableString = function(s){
    var usable = true;
    usable = (s !== null && typeof s === 'string' || s.length > 0);
    return usable;
};



this.isGuide = function(req){
    var is = false;
    if(req.session){
        if(req.session.guide){
            is = true;
        }
    }
    console.log('     is guide: ' + is);
    return is;
};

this.isLoggedIn = function(req){
    var is = false;
    if(req.session){
        if(req.session.loggedIn){
            is = true;
        }
    }
    console.log('     logged in: ' + is);
    return is;
};

this.hasSession = function(req){
    var has = false;
    if(req.session){
        if(req.session.username){
            has = true;
        }
    }
    console.log('     has session: ' + has);
    return has;
};

this.hasLanguages = function(req){
    var has = false;
    if(req.session && req.session.guide){
        if(req.session.hasLanguages){
            has = true;
        }
    }
    console.log('     has languages: ' + has);
    return has;
};

this.hasAreas = function(req){
    var has = false;
    if(req.session && req.session.guide){
        if(req.session.hasAreas){
            has = true;
        }
    }
    console.log('     has areas: ' + has);
    return has;
};

this.touristHasLanguages = function(req){
    var has = false;
    
    if(req.session && !req.session.guide){
        if(req.session.languages && req.session.languages.length > 0){
            has = true;
        }
    }
    
    return has;
};

//TODO delete?
/*
this.hasSetLanguages = function(req){
    var has = false;
    
    if(req.session){
        if(req.session.setLanguages){
            has = true;
        }
    }
    
    return has;
};
*/

this.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
//-----tourist
this.createTouristUsername = function(){
    //TODO make better
    return Date.now();
};

this.renderTouristLanguages = function(res){
    res.render('touristLanguages', {title: "__Tourist Languages", langs: ISO6391});
};

this.renderTouristLocation = function(res){
    res.render('touristLocation', {title: "__Tourist Location"});
};