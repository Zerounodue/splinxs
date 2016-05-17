/**
 * Created by Zerododici on 19.04.16.
 */
var ISO6391 = require('iso-639-1');
var i18n = require("i18n-express");

this.redirectHome = function(res){
    res.redirect('/');
};

this.redirectGuide = function(res){
    res.redirect('/guide');
};

this.renderGuide = function(res){
    var texts = res.req.i18n_texts;
    var name = res.req.session.username;
    res.render('guide', {title: texts.GENERAL.GUIDE, name: name});
};

this.renderGuideLangs = function(res, sLangs){
    var texts = res.req.i18n_texts;
    if(typeof sLangs === 'undefined' || sLangs === null) sLangs = [];
    res.render('guideLanguages', {title: texts.G_LANGUAGES.TITLE, langs: ISO6391, savedLangs: sLangs});
};

this.renderGuideAreas = function(res, sAreas){
    var texts = res.req.i18n_texts;
    if(typeof sAreas === 'undefined' || sAreas === null) sAreas = [];
    res.render('guideAreas', {title: texts.G_AREAS.G_AREAS, savedAreas: sAreas});
};

this.renderGuidePW = function(res){
    var texts = res.req.i18n_texts;
    res.render('guidePassword', {title: texts.G_PASSWORD.G_PASSWORD});
};

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
    return is;
};

this.isLoggedIn = function(req){
    var is = false;
    if(req.session){
        if(req.session.loggedIn){
            is = true;
        }
    }
    return is;
};

this.hasSession = function(req){
    var has = false;
    if(req.session){
        if(req.session.username){
            has = true;
        }
    }
    return has;
};

this.hasLanguages = function(req){
    var has = false;
    if(req.session && req.session.guide){
        if(req.session.hasLanguages){
            has = true;
        }
    }
    return has;
};

this.hasAreas = function(req){
    var has = false;
    if(req.session && req.session.guide){
        if(req.session.hasAreas){
            has = true;
        }
    }
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

this.touristHasLocation = function(req){
    var has = false;
    if(req.session && !req.session.guide){
        if(req.session.lat && req.session.lng && req.session.lat.toString().length > 0 && req.session.lng.toString().length > 0){
            has = true;
        }
    }    
    return has;
};

this.touristHasUsername = function(req){
    var has = false;
    if(req.session && !req.session.guide){
        if(req.session.username){
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

this.redirectTourist = function(res){
    res.redirect('/tourist');
};

this.renderTouristSite = function(res){
    var texts = res.req.i18n_texts;
    var name = res.req.session.username;
    res.render('tourist', {title: texts.GENERAL.TOURIST, name: name});
};

this.renderTouristLanguages = function(res, codes){
    var texts = res.req.i18n_texts;
    res.render('touristLanguages', {title: texts.T_LANGUAGES, langs: ISO6391, codes:codes});
};

this.renderTouristLocation = function(res){
    var texts = res.req.i18n_texts;
    res.render('touristLocation', {title: texts.T_LOCATION});
};

this.logout = function(res){
    var req = res.req;
    req.logout();
    if(req.session){
        req.session.destroy(function (err) {
            if (err) {
                console.log("logout error: " + err);
                return next(err);
            }
        });
    }
};