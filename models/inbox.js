var mongoose = require("mongoose");
// var postSchema = require("./posts.js");


var inboxSchema = new mongoose.Schema({
    

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    messages: [{
        created_at: Date,
        subject: String,
        body: String,
        status: {type: String, enum: ['read', 'not_read']},
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }]
});


module.exports = mongoose.model("inbox", inboxSchema);
