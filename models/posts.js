var mongoose = require("mongoose");


var postSchema = new mongoose.Schema({
    created_at: Date,
    body: String
    // created_by: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users'
    // }
    // comments: [{
    //     body: String,
    //     created_by: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'users'
    //     }
    // }]
});


module.exports = mongoose.model("posts", postSchema);
