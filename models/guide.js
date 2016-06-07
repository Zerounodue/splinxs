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
var passportLocalMongoose = require('passport-local-mongoose');

var area = new Schema({
    lat: Number,
    lng: Number,
    radius: { type: Number, min: 0 }
},{ _id : false });

var Guide = new Schema({
    username: { type: String, index: { unique: true } },
    //password: String, not needed due to passport?
    email: { type: String, unique: true },
    state: { type: Number, enum: [1, 2], default: 2 }, //1 available, 2 unavailable
    helped: { type: Number, min: 0 },
    languages: [String],
    areas: [area]
});

Guide.statics.findMatchingGuides = function (params) {
    
    this.find({languages: { $in: params.languages}});
    
};

Guide.methods.isInArea = function isInArea (pos) {
    var inArea = false;
    
    for(var i = 0; i < this.areas.length; i++){
        var distance = getDistanceFromLatLonInKm(pos.lat, pos.lng, this.areas[i].lat, this.areas[i].lng);
        if(distance < this.areas[i].radius){
            inArea = true;
            break;
        }
    }
  return inArea;
};

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

Guide.plugin(passportLocalMongoose);

module.exports = mongoose.model('Guide', Guide);