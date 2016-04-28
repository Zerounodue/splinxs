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