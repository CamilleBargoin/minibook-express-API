var sessionModel = require("../models/sessions");
 
var sessionService = {


    findSession: function(sessionId, callback) {

        sessionModel.findOne({_id: sessionId}, function(err, doc) {
                callback(doc);
        });
    },

    killSession: function(sessionId, callback) {

        sessionModel.findOne({_id: sessionId}).remove().exec(function(err, r) {
            callback(err, r);
        });
    }
};

module.exports = sessionService;
