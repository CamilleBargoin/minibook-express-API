var express = require('express');
var router = express.Router();
var sessionService = require('../services/sessionService.js');
var usersModel = require("../models/users");
var postsModel = require("../models/posts");
var wallsModel = require("../models/walls");
var ObjectId = require('mongoose').Types.ObjectId; 





router.get("/user/:id", function(req, res, next) {

    console.log("get posts by user id");

    if (req.query && req.query.sessionId) {


        sessionService.findSession(req.query.sessionId,  function(session) {


           if (session) {
                
                postsModel.find({created_by: new ObjectId(req.params.id)}, function(err, docs) {

                    if (!err ) {

                        res.json({posts: docs});   
                    }
                    else {
                        console.log(err);
                        res.json({
                            error: "impossible de récupérer les posts"
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
});

router.post("/create", function(req, res, next) {

    console.log("create new post");


    if (req.body && req.body.sessionId && (req.body.target || req.body.post.created_by.userId)) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                var newPost = {created_at: new Date().getTime(), body: req.body.post.body, created_by: new ObjectId(req.body.post.created_by.userId)};
                
                wallsModel.findOneAndUpdate(
                    {user: new ObjectId(req.body.target)},
                    {$push: {"posts": {$each: [newPost], $position: 0 }}},
                    {safe: true, new : true}).populate('posts.created_by', 'firstname lastname avatar').sort().exec(function(err, model) {

                        if (!err)
                            res.json({data: model });
                        else {
                            console.log(err);
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



router.post("/addComment", function(req, res, next) {


    if (req.body && req.body.sessionId && req.body.postId) {


        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                var newComment = req.body.comment;

                wallsModel.findOneAndUpdate(
                    {"posts._id": new ObjectId(req.body.postId)},
                    {$push: {"posts.$.comments": {created_at: new Date().getTime(), body: newComment.body, created_by: new ObjectId(newComment.created_by.userId)}}},
                    {safe: true, new : true}
                ).populate('posts.created_by', 'firstname lastname avatar').populate('posts.comments.created_by', 'firstname lastname')
                .exec(function(err, model) {

                        if (!err)
                            res.json({data: model});
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