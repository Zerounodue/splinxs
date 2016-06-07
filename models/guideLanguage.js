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

module.exports = mongoose.model('GuideLanguage', GuideLanguage);