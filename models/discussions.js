var mongoose = require("mongoose");

var findOrCreate = require('mongoose-findorcreate');

var discussionSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    messages: [{
        created_by: {
                type: mongoose.Schema.Types.ObjectId
        },
        body: String,
        created_at: Date
    }]
});

discussionSchema.plugin(findOrCreate);

module.exports = mongoose.model("discussions", discussionSchema);