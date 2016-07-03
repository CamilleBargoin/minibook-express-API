var mongoose = require("mongoose");
var postSchema = require("./posts.js");





var userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    firstname: String,
    lastname: String,
    created_at: Date,
    age: Number,
    address: String,
    city: String,
    friends: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        status: String
    }]
        
});

module.exports = mongoose.model("users", userSchema);