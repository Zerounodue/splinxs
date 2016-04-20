/**
 * Created by Zerododici on 19.04.16.
 */
var ISO6391 = require('iso-639-1');

this.redirectHome = function(res){
    res.redirect('/');
};

this.renderGuide = function(res){
    res.render('guide', {title: '__Guide'});
};

this.renderGuideLangs = function(res, sLangs){
    if(typeof sLangs === 'undefined' || sLangs === null) sLangs = [];
    res.render('guideLanguages', {title: "__Guide Languages", langs: ISO6391, savedLangs: sLangs});
};

this.renderGuideAreas = function(res, sAreas){
    if(typeof sAreas === 'undefined' || sAreas === null) sAreas = [];
    res.render('knownAreas', {title: "__Choose Areas", savedAreas: sAreas});
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
        if(req.session.languages){
            has = true;
        }
    }
    console.log('     has languages: ' + has);
    return has;
};

this.hasAreas = function(req){
    var has = false;
    if(req.session && req.session.guide){
        if(req.session.areas){
            has = true;
        }
    }
    console.log('     has areas: ' + has);
    return has;
};

this.hasSetLanguages = function(req){
    var has = false;
    
    if(req.session){
        if(req.session.setLanguages){
            has = true;
        }
    }
    
    return has;
};