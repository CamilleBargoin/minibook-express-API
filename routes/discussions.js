var express = require('express');
var router = express.Router();
var sessionService = require('../services/sessionService.js');
var mongoose = require("mongoose");
var usersModel = require("../models/users");
var discussionModel = require("../models/discussions");
var ObjectId = require('mongoose').Types.ObjectId; 




router.post('/open', function(req, res, next) {

    console.log("open discussion");

    if (req.body && req.body.sessionId && req.body.target) {

        sessionService.findSession(req.body.sessionId, function(session) {


            if(session) {

                var sessionObj = JSON.parse(session.session);
                discussionModel.findOne({

                        participants:  {$all: [ req.body.target, sessionObj.userId]}
                
                }, function(err, model) {
                  console.log(model);
                  if (err) {
                    console.log(err);
                  }
                  else {

                    if (model) {

                        res.json({
                            discussion: model
                        });
                    }
                    else {

                        var newDiscussion = {
                            participants: [req.body.target, sessionObj.userId],
                            messages: []
                        };
                        discussionModel.create(newDiscussion).populate("messages.created_by", "firstname lastname avatar").exec( function(err, model) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                res.json({
                                    discussion: model
                                });
                            }
                        });
                        console.log("NEW DOCU");
                    }
                  }
                  
                });
            }
            else {
                res.json({
                    error: "access denied"
                });
            }

        });

    }
    else {
        res.json({
            error: "access denied"
        });
    }

});


router.post('/get', function(req, res, next) {

    console.log("get discussion");

    if (req.body && req.body.sessionId && req.body.discussionId) {

        sessionService.findSession(req.body.sessionId, function(session) {


            if(session) {

                discussionModel.findById(req.body.discussionId).populate("messages.created_by", "firstname lastname avatar").exec(function(err, model) {
                  
                  if (err) {
                    console.log(err);
                  }
                  else {
                    res.json({
                        discussion: model
                    });
                  }
                  
                });
            }
            else {
                res.json({
                    error: "access denied"
                });
            }

        });

    }
    else {
        res.json({
            error: "access denied"
        });
    }

});


router.post('/newMessage', function(req, res, next) {

    console.log("create new message in discussion");

    if (req.body && req.body.sessionId && req.body.discussionId) {

        sessionService.findSession(req.body.sessionId, function(session) {


            if(session) {
                var sessionObj = JSON.parse(session.session);


                discussionModel.findOneAndUpdate(
                    {_id: req.body.discussionId}, 
                    {
                        $push: { "messages": req.body.message } 
                    },
                    {
                        safe: true, 
                        new : true
                    }, function(err, model) {
                        if (err) {
                            console.log(err);
                            res.json({
                                error: "Une erreur est survenue"
                            });
                        }
                        else {
                            res.json({discussion: model});
                        }
                    }
                );


            }
             else {
                res.json({
                    error: "access denied"
                });
            }
        });
    } 
    else {
        res.json({
            error: "access denied"
        });
    }
});




module.exports = router;