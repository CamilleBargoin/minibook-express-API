var mongoose = require("mongoose");


var sessionSchema = new mongoose.Schema({
    _id: String,
    session: String,
    expires: {
        $date: Date
    }
});

module.exports = mongoose.model("sessions", sessionSchema);