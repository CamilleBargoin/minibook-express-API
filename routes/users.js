var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var sessionService = require('../services/sessionService.js');
var mongoose = require("mongoose");
var usersModel = require("../models/users");
var wallsModel = require("../models/walls");
var ObjectId = require('mongoose').Types.ObjectId; 
var inboxModel = require("../models/inbox");



router.post('/register', function(req, res, next) {

    res.set('Content-Type', 'application/json');

    if (req.body) {
        usersModel.findOne({email: req.body.email}, function(err, doc) {
            if (!err) {
                if (doc == null) {

                    var newUser = new usersModel({
                        email: req.body.email,
                        password: generateHash(req.body.password),
                        created_at: new Date().getTime(),
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        role: 1 // user
                    });

                    newUser.save(function (err) {
                        if (!err) {
                            req.session.email = newUser.email;
                            req.session.userId = newUser._id;
                            res.json({ userId: newUser._id, email: newUser.email});


                            var newWall = new wallsModel({
                                user: newUser._id,
                                posts: []
                            });

                            newWall.save();

                            var newInbox = new inboxModel({
                                user: newUser._id,
                                messages: []
                            });

                            newInbox.save();


                        }
                    });

                }
                else {
                    // Login already exists in DB
                    res.json({ error: 'user existe deja' });
                }
            }
        });
    }
});


router.get("/logout", function(req, res, next) {
    console.log("log out");

    if (req.query && req.query.sessionId) {

        sessionService.killSession(req.query.sessionId, function(err, r) {

            console.log("______________");
            console.log(err);
            if (err) {
                res.json({error: ""});
            }
            else {
                res.json({success: "deconnecté avec succès"});
            }
        });
    }
});



router.post('/login', function(req, res, next) {

    console.log("login route");

    if (req.body && req.body.email && req.body.password) {

       
        usersModel.findOne({email: req.body.email}, function(err, doc) {

            if (!err ) {

                if (validPassword(req.body.password, doc.password)) {
                    loggedInUser = doc;
                    req.session.email = loggedInUser.email;
                    req.session.userId = loggedInUser._id;

                    res.json({ userId: loggedInUser._id, sessionId: req.session.id});
                }
                else {
                    req.session.customInfo = "Identifiant et/ou mot de passe incorrect(s)";
                    res.redirect("/");
                }
            }
            else {
                console.log(err);
            }
        });
    }
});


router.get('/secure', function(req, res, next) {

    console.log("secure route: " + req.query.sessionId);
    sessionService.findSession(req.query.sessionId, function(session) {
        if (session) {

            res.json({ success: "access granted"});
        }
        else {
            res.json({ error: "access denied"});
        }
    });
});

router.get('/secureAdmin', function(req, res, next) {

    console.log("admin secure route: " + req.query.sessionId);
    sessionService.findSession(req.query.sessionId, function(session) {
        if (session) {

            var sessionObj = JSON.parse(session.session);
            usersModel.findOne({_id: sessionObj.userId, role: 2}, function(err, user) {
                
                if (user){
                    res.json({ success: "access granted"});
                }
                else {

                    res.json({ error: "access denied"});
                }

            });
        }
        else {
            res.json({ error: "access denied"});
        }
    });
});

router.post('/all', function(req, res, next) {

    console.log("get all users");
    console.log(req.body);
    if (req.params && req.body.sessionId) {

        sessionService.findSession(req.body.sessionId, function(session) {
            if (session) {

                usersModel.find({}, "-password -__v").populate("friends.user", "firstname lastname avatar").exec(function(err, docs) {
                    if (!err ) {
                        res.json(docs);   
                    }
                    else {
                        console.log(err);
                        res.json({
                            error: "un problème est survenu"
                        });
                    }

                });
                
            }
        });
    }
    else {
        res.json({ error: "accès refusé"});
    }
});

router.get('/:id', function(req, res, next) {
    console.log("get user by id");


    usersModel.findOne({_id: new ObjectId(req.params.id)}, "-password -__v").populate("friends.user", "firstname lastname avatar").exec(function(err, doc) {
        if (!err ) {
            res.json(doc);   
        }
        else {
            console.log(err);
            res.json({
                error: "utilisateur introuvable"
            });
        }

    });
});


router.get('/wall/:id', function(req, res, next) {
    console.log("get user wall by id");


    wallsModel.findOne({'user': new ObjectId(req.params.id)}).populate("user posts.created_by posts.comments.created_by", "firstname lastname avatar").exec(function(err, doc) {
        if (!err ) {
            res.json(doc);   
        }
        else {
            console.log(err);
            res.json({
                error: "utilisateur introuvable"
            });
        }

    });
});


router.post("/update", function(req, res, next) {
    console.log("upate user");
console.log(req.body);
    if (req.body && req.body.userId && req.body.sessionId) {


        sessionService.findSession(req.body.sessionId, function(session) {
            if (session) {

                usersModel.findOneAndUpdate({
                    _id: new ObjectId(req.body.userId)
                }, {
                    $set: req.body.updatedFields
                }, {
                    returnNewDocument: true
                }, function(e) {
                    
                    res.json({status: 1});
                });

            }
            else {
                res.json({ error: "access denied"});
            }
        });

    }
    else {
        res.json({
            error: "access denied"
        });
    }

});

router.post('/search', function(req, res, next) {
    console.log('search users');

    if (req.body && req.body.sessionId ) {


        sessionService.findSession(req.body.sessionId, function(session) {
            if (session) {

                usersModel.find({
                    firstname: {$regex : ".*" + req.body.string + ".*"}
                }, "_id firstname lastname", function(err, docs) {
                    if (err) {

                    }
                    else {
                        
                        res.json({
                            users: docs
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

router.post("/invite", function(req, res, next) {
    console.log("invite user");

    if (req.body && req.body.sessionId && req.body.userId) {
        sessionService.findSession(req.body.sessionId, function(session) {

            if (session) {

                var sessionObj = JSON.parse(session.session);


                usersModel.findOneAndUpdate({
                    _id: new ObjectId(req.body.userId),
                    "friends.user": {
                            $nin: [new ObjectId(sessionObj.userId)]
                        }
                    },
                    {
                        $push: {
                            "friends": {
                                user: new ObjectId(sessionObj.userId),
                                status: "pending"
                            }
                        }
                    },
                    {
                        safe: true, 
                        new : true
                    }, function(err, model) {

                        if (!err) {

                            usersModel.findOneAndUpdate(
                                {
                                _id: new ObjectId(sessionObj.userId),
                                "friends.user": {
                                        $nin: [new ObjectId(req.body.userId)]
                                    }
                                },
                                {
                                    $push: {
                                        "friends": {
                                            user: new ObjectId(req.body.userId),
                                            status: "sentRequest"
                                        }
                                    }
                                },
                                {
                                    safe: true, 
                                    new : true
                                }, function(err, model) {

                                    if (!err) {
                                        res.json({status: 1});
                                    }
                                    else {
                                        console.log(err);
                                        res.json({
                                            error: "impossible d'envoyer l'invitation"
                                        });
                                    }
                                }
                            );
                            
                        }
                        else {
                            console.log(err);
                            res.json({
                                error: "impossible d'envoyer l'invitation"
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


router.post("/requests", function(req, res, next) {
    console.log("get pending requests");

    if (req.body && req.body.sessionId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if (session) {

                var sessionObj = JSON.parse(session.session);
                var db = req.db.get();
                var collection = db.collection("friendRequests");

                collection.find({to: sessionObj.userId}, {from: 1, from_fullname: 1}).toArray(function(err, docs) {
                    if (err) {
                        res.json({
                            error: "la requête a échouée"
                        });
                    }
                    else {

                        res.json({
                            requests: docs
                        });
                    }
                }) ;

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


router.post("/befriend", function(req, res, next) {
    console.log("add friends");

    if (req.body && req.body.sessionId && req.body.friendId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                var sessionObj = JSON.parse(session.session);


                usersModel.findById(sessionObj.userId, function (err, user) {

                    if(err) {

                    }
                    else {

                        var friend = user.friends.filter(function (friend) {
                            return friend.user == req.body.friendId;
                        }).pop();
                        
                        friend.status = "accepted";
                        user.save(function() {


                            usersModel.findById(req.body.friendId, function (err, user) {

                                if(err) {

                                }
                                else {

                                    var friend = user.friends.filter(function (friend) {
                                        return friend.user == sessionObj.userId;
                                    }).pop();
                                    
                                    friend.status = "accepted";
                                    user.save(function() {

                                        res.json({status: 1});
                                        
                                    });
                                }
                            });


                            
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



router.post("/deleteRequest", function(req, res, next) {
    console.log("delete request");

    if (req.body && req.body.sessionId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                var db = req.db.get();
                var collection = db.collection("friendRequests");
                var mongo = require('mongodb');

                collection.findOneAndDelete({
                    _id: new mongo.ObjectId(req.body.requestId)
                }, function(err, result) {

                    if (err) {

                    }
                    else {
                        res.json({status: 1});
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


router.post("/friends", function(req, res, next) {
    console.log("get friends");

    if (req.body && req.body.sessionId) {

        sessionService.findSession(req.body.sessionId, function(session) {

            if(session) {

                usersModel.findOne({
                    _id: new ObjectId(req.body.userId)
                }, "friends", function(err, result) {

                    // if (err) {

                    // }
                    // else {
                        

                    //     var friendsId = result.friends.map(function(friend, index) {
                    //         return new mongo.ObjectId(friend.userId);
                    //     });


                    //     collection.find({
                    //         _id: {$in: friendsId}
                    //     }).toArray().then(function(friends) {
                    //         if (friends) {
                    //             res.json({friends: friends});
                    //         }
                    //     });
                    // }

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




var generateHash = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

var validPassword = function(password, hash) {
    return bcrypt.compareSync(password, hash);
};




module.exports = router;