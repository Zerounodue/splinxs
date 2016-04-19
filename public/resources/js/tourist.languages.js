/**
 * tourist.languages.js
 * contains functions for selecting the languages of a tourist
 * used by tourists
 */

//variables
var showLogs = true;
//{code: string, skill: number}
var languages = [];
var localStorageKey = "languages";

//DOM elements
var langForm;

$(document).ready(function () {
    if(showLogs) console.log('tourist languages document ready');
    
    //add existing languages
    addSavedLanguages();
    
    
    
    $("#btn_sendLanguages").on('click', function (e) {
        if(showLogs) console.log('send languages button clicked');
        
        if(languages.length > 0){
            submitLanguages();
        }else{
            alert('__no languages selected');
            //prevent form from being submitted
            return false;
        }
        
    });
});

function addLanguage(code, skill){
    if(showLogs) console.log("add language, code: " + code + ", skill: " + skill);
    if(getLanguage(code) < 0){
        languages.push({code: code, skill: skill});
    }
}

function removeLanguage(code){
    if(showLogs) console.log("remove language, code: " + code);
    var index = getLanguage(code);
    if(index > -1){
        languages.splice(index, 1);
    }
}

function setSkill(code, skill){
    if(showLogs) console.log("set skill, code: " + code + ", skill: " + skill);
    var index = getLanguage(code);
    if(index > -1){
        languages[index].skill = skill;
    }
}

function getLanguage(code){
    var index = -1;
    for(var i = 0; i < languages.length; i++){
        if(languages[i].code == code){
            index = i;
            break;
        }
    }
    return index;
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
            //addSelectedLanguageToDOM(value.code, value.language);
            displaySelectedLanguage(value.code, value.skill);
        });
    }else{
        if(showLogs) console.log('no saved languages');
    }
}

function displaySelectedLanguage(code, skill){
    $("#" + code).prop('checked', true);
    $("#div_" + code).show();
    $('input[name="skill_' + code + '"][value="' + skill + '"]').prop('checked', true);
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