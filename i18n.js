//example from https://www.drzon.net/i18n-for-node-express/
var i18n = require('i18n');//mashpie i18n-node module https://github.com/mashpie/i18n-node/

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'de', 'it'],

    // where to store json files - defaults to './locales' relative to modules directory - changed to i18n
    directory: __dirname + '/i18n',
    defaultLocale: 'en',
    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang',
    //very important or hirarchy in json file doesn't work
    objectNotation: true,
    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter: 'lang',
});




module.exports = function(req, res, next) {

    i18n.init(req, res);
    res.locals.__= res.__;
    
    var current_locale = i18n.getLocale();

    return next();
};