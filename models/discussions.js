var mongoose = require("mongoose");

var findOrCreate = require('mongoose-findorcreate');

var discussionSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    messages: [{
        created_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
        },
        body: String,
        created_at: Date
    }]
});

discussionSchema.plugin(findOrCreate);

module.exports = mongoose.model("discussions", discussionSchema);