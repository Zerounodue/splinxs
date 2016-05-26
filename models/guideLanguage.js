/**
 * Copyright Ⓒ 2016 Splinxs
 * Authors: Elia Kocher, Philippe Lüthi
 * This file is part of Splinxs.
 * 
 * Splinxs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License V3 as published by
 * the Free Software Foundation, see <http://www.gnu.org/licenses/>.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GuideLanguage = new Schema({
    codes: [String]
});
/*
var GuideLanguage = new Schema({
    codes: [String]
},{ _id : false });
*/

//TODO remove languages if a guide removes it in his settings



//GuideLanguage.statics.addCodes = function addCodes (c) {
    //check if lang is already in array
    /*
    for(var i = 0; i < c.length; i++){
        /*
        if((this.codes.indexOf(c[i]) < 0)){
            //this.codes.push(c[i]);
            this.update({$push: {codes: c[i]}});
        }
        
       
        GuideLanguage.update({$addToSet: {codes: c[i]}});
        
       
    }
    */
    //GuideLanguage.update({$addToSet: {codes: {$each: c}}});
  //  removeUnusedCodes();
//};

//function removeUnusedCodes(){
    
//}



module.exports = mongoose.model('GuideLanguage', GuideLanguage);