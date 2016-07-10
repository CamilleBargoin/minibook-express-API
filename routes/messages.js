var express = require('express');
var router = express.Router();
var sessionService = require('../services/sessionService.js');
var mongoose = require("mongoose");
var usersModel = require("../models/users");
var inboxModel = require("../models/inbox");
var ObjectId = require('mongoose').Types.ObjectId; 




router.get('/inbox', function(req, res, next) {
    console.log("get inbox");

    if (req.query && req.query.sessionId) {


        sessionService.findSession(req.query.sessionId, function(session) {

            if (session) {

                console.log("session !!!");

                var sessionObj = JSON.parse(session.session);

                inboxModel.findOne({'user': sessionObj.userId}).populate("user messages.created_by", "firstname lastname avatar").exec(function(err, doc) {
                    if (!err ) {
                        res.json(doc);   
                    }
                    else {
                        console.log(err);
                        res.json({
                            error: "données introuvables"
                        });
                    }
                });
            }
            else {
                res.json({ error: "accès refusé"});
            }
        });

    }
    else {
        res.json({ error: "accès refusé"});
    }

});


router.post('/new', function(req, res, next) {

    console.log("create new message");

    if (req.body && req.body.sessionId && req.body.target && req.body.message.created_by.userId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                inboxModel.findOneAndUpdate(
                    {user: new ObjectId(req.body.target)},
                    {$push: {"messages": {
                        created_at: new Date().getTime(), 
                        subject:req.body.message.subject, 
                        body: req.body.message.body, 
                        created_by: new ObjectId(req.body.message.created_by.userId)
                    }}},
                    {safe: true, new : true},
                    function(err, model) {

                        if (!err)
                            res.json({status: 1});
                        else {
                            console.log(err);
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

router.post('/read', function(req, res, next) {

    console.log("read message");

    if (req.body && req.body.sessionId && req.body.messageId && req.body.userId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                inboxModel.findOne(
                    {user: req.body.userId},
                    function(err, inbox) {

                        if (!err){
                                                    
                            var message = inbox.messages.filter(function(message) {
                                return message._id == req.body.messageId;
                            }).pop();

                            message.status = "read";

                            inbox.save(function() {
                                res.json({status: 1});
                            });


                        }
                        else {
                            console.log(err);
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