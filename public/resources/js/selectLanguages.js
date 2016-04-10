/**
 * selectLanguages.js
 * contains functions for selecting languages
 * used by guides and tourists
 */

//variables
var showLogs = true;
var languages = [];
var localStorageKey = "languages";
//DOM elements
var langForm;
var inp_lang;
var selectedLanguages;

$(document).ready(function () {
    if (showLogs) console.log('selectLanguages document ready');
    dataList = $("#languages");
    selectedLanguages = $("#div_selectedLanguages");
    inp_lang = $("#inp_languages");
    langForm = $("#frm_languages");
    
    //add existing languages
    addSavedLanguages();
    
    $("#inp_languages").on('input', function (e) {
        var input = $(this).val();
        var code = $("#languages option[value='" + input + "']").attr('code');
        if(code != undefined){
            addLanguage(code, input);
        }
    });
    
    $("#btn_sendLanguages").on('click', function (e) {
        if(showLogs) console.log('send languages button clicked');
        
        if(languages.length > 0){
            submitLanguages();
        }else{
            alert('__no languages selected');
        }
        
    });
    
});
/**
 * adds the selected language, if it is not already in the list
 * @param {string} c language code
 * @param {string} l language name
 */
function addLanguage(c, l) {
    //check if language is already in list
    var exists = false;
    for(var i = 0; i < languages.length; i++){
        if(languages[i].code == c){
            exists = true;
            break;
        }
    }
    //only add if the language is not already in the list
    if (!exists) {
        if (showLogs) console.log('add language code: ' + c + ", language: " + l);
        languages.push({code: c, language: l});
        addSelectedLanguageToDOM(c, l);
    }
    inp_lang.val('');
}
/**
 * removes the code from the selected languages
 * @param {string} c language code
 */
function removeLanguage(c) {
    if (showLogs) console.log('remove language: ' + c);
    //var i = languages.indexOf({code: c});
    var i = languages.map(function(e) { return e.code; }).indexOf(c);
    if (languages.length > 0 && i > -1) {
        languages.splice(i, 1);
        removeSelectedLanguageFromDOM(c);
    }
}
/**
 * adds the selected language to the DOM
 * @param {string} c language code
 * @param {string} l language name
 */
function addSelectedLanguageToDOM(c, l) {
    if (showLogs) console.log('add language to DOM');
    var html =
        "<div id='div_lang_" + c + "'>" +
            "<button id='btn_lang_" + c + "'>-</button>" +
            "<a>" + l + "</a>" +
        "</div>";
    selectedLanguages.append(html);

    $("#btn_lang_" + c).click(function () {
        if (showLogs) console.log('remove lang ' + c + ' button clicked');
        removeLanguage(c);
    });
}
/**
 * removes a selected language element
 * @param {string} c code of the language to remove
 */
function removeSelectedLanguageFromDOM(c) {
    $("#div_lang_" + c).remove();
}
/**
 * sends the selected languages to the server and stores them in the localstorage
 */
function sendLanguages(){
    //TODO send languages
    
    //TODO save to localstorage
    saveToLocalStorage(localStorageKey, languages);
}
/**
 * checks if the languages array contains elements => guide
 * checks if there are languages in localstorage => tourist
 * adds them if available
 */
function addSavedLanguages(){
    if(showLogs) console.log('add saved languages');
    //languages empty => new tourist or guide
    if(languages.length < 1){
        languages = getFromLocalStorage(localStorageKey);
        //new tourist
        if(languages == null){
            languages = [];
        }
    }
    //saved languages available
    if(languages.length > 0){
        if(showLogs) console.log('saved languages: ' + languages.length);
        //languages already in object, just need to add it to DOM
        $.each(languages, function(index, value){
            addSelectedLanguageToDOM(value.code, value.language);
        });
    }else{
        if(showLogs) console.log('no saved languages');
    }
}
/**
 * saves data to the localstorage with a given key
 * @param {string} key to save data with
 * @param {object} data to save
 */
function saveToLocalStorage(key, data){
    if(showLogs) console.log('saving to localstorage, key: ' + key + ' data: ' + data);
    //clearLanguageStorage();
    localStorage.setItem(key,JSON.stringify(data));
}
/**
 * gets an object stored in localstorage or null
 * @param {string} key item to get from localstorage
 * @returns {Object} the object from localstorage or null
 */
function getFromLocalStorage(key){
    if(showLogs) console.log('getting from localstorage, key: ' + key);
    var data = JSON.parse(localStorage.getItem(key));
    return data;
}
/**
 * delets all items from localstorage (if localStorage is supported by the device)
 */
function clearLanguageStorage(){
    console.log('clear');
    if(typeof(Storage) !== "undefined") {
        localStorage.removeItem(localStorageKey);
    }
}

function submitLanguages(){
    //sort languages by code
    languages.sort(compareLanguages);
    saveToLocalStorage(localStorageKey, languages);
    var langs = JSON.stringify(languages);
    
    langForm.empty();
     $('<input id=\'langs\'/>').attr('type', 'hidden')
          .attr('name', "languages")
          .attr('value', langs)
          .appendTo('#frm_languages');
    langForm.submit();
    
}
/**
 * compares if the first value is smaller, bigger or the same as the first value
 * @param {Object{code: string, language: string}} a value to compare
 * @param {Object{code: string, language: string}} b value to compare against
 * @returns {Number} -1 if a is smaller, 1 if a is bigger, 0 if they are equal
 */
function compareLanguages(a, b)
{
    if (a.code < b.code) return -1;
    if (a.code > b.code) return 1;
    return 0;
}