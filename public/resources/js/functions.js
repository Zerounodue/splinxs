/**
 * Created by Zerododici on 19.04.16.
 */
var ISO6391 = require('iso-639-1');

this.redirectHome = function(res){
    res.redirect('/');
}


this.renderChooseLangs = function(res){
    res.render('chooseLanguages', {title: "__Choose Languages", langs: ISO6391});
}

this.renderChooseAreas = function(res){
    res.render('knownAreas', {title: "__Choose Areas"});
}


//function usableString(s) {
this.usableString = function(s){
    var usable = true;
    usable = (s !== null && typeof s === 'string' || s.length > 0);
    return usable;
}



this.isGuide = function(req){
    var is = false;
    if(req.session){
        if(req.session.guide){
            is = true;
        }
    }
    console.log('     is guide: ' + is);
    return is;
}

this.isLoggedIn = function(req){
    var is = false;
    if(req.session){
        if(req.session.loggedIn){
            is = true;
        }
    }
    console.log('     logged in: ' + is);
    return is;
}

this.hasSession = function(req){
    var has = false;
    if(req.session){
        if(req.session.username){
            has = true;
        }
    }
    console.log('     has session: ' + has);
    return has;
}

this.hasCompleteSession = function(req){
    var has = false;

    if(req.session){
        if(req.session.complete){
            has = true;
        }
    }

    console.log('     complete session: ' + has);
    return has;
}