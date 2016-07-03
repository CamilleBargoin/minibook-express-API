var mongoose = require("mongoose");
var postSchema = require("./posts.js");


var wallsSchema = new mongoose.Schema({
    

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    posts: [{
        created_at: Date,
        body: String,
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        comments: [{
            created_at: Date,
            body: String,
            created_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }]
    }]
});


module.exports = mongoose.model("walls", wallsSchema);
