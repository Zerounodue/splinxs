/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

/**
 * selectLanguages.js
 * contains functions for selecting languages
 * used by guides and tourists
 */

//variables
var showLogs = false;
var languages = [];
//DOM elements
var langForm;
var inp_lang;
var selectedLanguages;
var animDur = 150;

$(document).ready(function () {
    if (showLogs) console.log('selectLanguages document ready');
    dataList = $("#languages");
    selectedLanguages = $("#div_selectedLanguages");
    inp_lang = $("#inp_languages");
    sel_languages = $("#sel_languages");
    langForm = $("#frm_languages");

    //add existing languages
    addSavedLanguages();

    inp_lang.on('input', function (e) {
        tryaddLanguage($(this).val());
    });

    sel_languages.on('change', function (e) {
        tryaddLanguage($(this).val());
    });
    
    $("#btn_sendLanguages").on('click', function (e) {
        if(showLogs) console.log('send languages button clicked');
        
        if(languages.length > 0){
            submitLanguages();
        }else{
            $("#nothingSelected").show();
            //prevent form from being submitted
            return false;
        }
        
    });
    $(".nothingSelectedClose").click(function () {
        $("#nothingSelected").hide(animDur);
    });

    if (!Modernizr.datalistelem) {
        $("#inp_languages").hide(animDur);
    }

});
/**
 * adds the selected language, if it is not already in the list
 * @param {string} c language code
 */
function addLanguage(c) {
    //check if language is already in list
    var exists = false;
    for(var i = 0; i < languages.length; i++){
       if(languages[i] == c){
            exists = true;
            break;
        }
    }
    //only add if the language is not already in the list
    if (!exists) {
        if (showLogs) console.log('add language code: ' + c);
        //languages.push({code: c, language: l});
        languages.push(c);
        addSelectedLanguageToDOM(c);
    }

    inp_lang.val('');
}
/**
 * removes the code from the selected languages
 * @param {string} c language code
 */
function removeLanguage(c) {
    if (showLogs) console.log('remove language: ' + c);

    if(languages.length > 0){
        var i = $.inArray(c, languages);
        if(i > -1){
            languages.splice(i, 1);
            removeSelectedLanguageFromDOM(c, i);
        }
    }
}
/**
 * adds the selected language to the DOM
 * @param {string} c language code
 */
function addSelectedLanguageToDOM(c) {
    if (showLogs) console.log('add language to DOM');
    var nativeName = $("#languages option[code='" + c + "']").attr('value');
    var html =
        "<div class='div-languages ' style='display:none' id='div_lang_" + c + "'>"
            + nativeName
            + "<img class='img-close'  id='btn_lang_" + c + "' src='resources/images/icons/close.png' draggable='false' alt='close'>"
        +"</div>";
    selectedLanguages.append(html);

    //add class to the first element
    $("#div_lang_"+languages[0]).addClass('div-languages-first');
    //add class to the last element
    $("#div_lang_"+languages[languages.length-1]).addClass('div-languages-last');
    //remove class to the previous last element
    if(languages.length >1){
        $("#div_lang_"+languages[languages.length-2]).removeClass('div-languages-last');
    }
    $("#btn_lang_" + c).click(function () {
        if (showLogs) console.log('remove lang ' + c + ' button clicked');
        $("#div_lang_" + c).hide(animDur, function() {
            removeLanguage(c);
        });
    });

    $("#div_lang_" + c).show(animDur);
}
/**
 * removes a selected language element
 * @param {string} c code of the language to remove
 */
function removeSelectedLanguageFromDOM(c, i) {
    $("#div_lang_" + c).remove();
    //if the first element was removed
    if(i ==0 && languages.length>0){
        //add class to the new first element
        $("#div_lang_"+languages[0]).addClass('div-languages-first');
    }
    //if the last element was removed
    if(i == (languages.length) && languages.length>0){
        //add class to the new last element
        $("#div_lang_"+languages[languages.length-1]).addClass('div-languages-last');
    }
}
/**
 * checks if the languages array contains elements => guide
 * checks if there are languages in localstorage => tourist
 * adds them if available
 */
function addSavedLanguages(){
    if(showLogs) console.log('add saved languages');

    //saved languages available
    if(languages.length > 0){
        if(showLogs) console.log('saved languages: ' + languages.length);
        //languages already in object, just need to add it to DOM
        $.each(languages, function(index, value){
            //addSelectedLanguageToDOM(value.code, value.language);
            addSelectedLanguageToDOM(value);
        });
    }else{
        if(showLogs) console.log('no saved languages');
    }
}

function submitLanguages(){
    //sort languages by code
    languages.sort(compareLanguages);

    var langs = JSON.stringify(languages);

    // Create the form object
    var languagesForm = document.createElement("form");
    languagesForm.setAttribute("method", "post");
    languagesForm.setAttribute("action", "/guideLanguages");
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "languages");
    hiddenField.setAttribute("value", langs);
    // append the newly created control to the form
    languagesForm.appendChild(hiddenField);
    document.body.appendChild(languagesForm); // inject the form object into the body section
    languagesForm.submit();
}

function tryaddLanguage(input){
    var code = $("#languages option[value='" + input + "']").attr('code');
    if(code != undefined){
        addLanguage(code, input);
    }

}

/**
 * compares if the first value is smaller, bigger or the same as the first value
 * @param {string} a value to compare
 * @param {string} b value to compare against
 * @returns {Number} -1 if a is smaller, 1 if a is bigger, 0 if they are equal
 */
function compareLanguages(a, b)
{
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}