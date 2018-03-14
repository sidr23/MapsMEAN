var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var SearchSchema = new Schema({
    _id:{
        type: String,
        required: true,
        unique: true
    },
    src: {
        type: String,
        required:true
    },
    dest: {
        type: String,
        required:true
    },
    searched_at:{
        type: Date
    }
});

SearchSchema.pre('save', function(next){
    now = new Date();
    this.searched_at = now;
    next();
});

module.exports = mongoose.model('Search', SearchSchema,'search');