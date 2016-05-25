var i18n = require('i18n');

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'de', 'it'],

    // where to store json files - defaults to './locales' relative to modules directory - changed to i18n
    directory: __dirname + '/i18n',

    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang',
    //very important or hirarchy in json file doesn't work
    objectNotation: true
});




module.exports = function(req, res, next) {

    i18n.init(req, res);
    res.locals.__= res.__;


    var current_locale = i18n.getLocale();

    return next();
};