var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');


router.post('/register', function(req, res, next) {

    res.set('Content-Type', 'application/json');

    if (req.body) {


    console.log(req.body.firstName);

        
        var db = req.db.get();
        var collection = db.collection('users');



            collection.findOne({email: req.body.email}, function(err, doc) {
                if (!err) {
                    if (doc == null) {
                        collection.insertOne({
                                email: req.body.email,
                                password: generateHash(req.body.password),
                                created_at: new Date().getTime(),
                                firstname: req.body.firstname,
                                lastname: req.body.lastname
                        }, function(err, result) {
                            if (!err) {
                                if (result.result.ok == 1) {

                                    req.session.email = result.ops[0].email;
                                    req.session.userId = result.ops[0]._id;
                                    // res.redirect("/home");
                                    res.json({ userId: result.ops[0]._id, email: result.ops[0].email});
                                }
                            }
                        });
                    }
                    else {
                        // Login already exists in DB
                        // res.redirect('/');
                        res.json({ error: 'user existe deja' });
                    }
                }
            });



        // console.log(p1.then(function(val) {

        //     return val;
        // }));

        
    }
});


router.get("/logout", function(req, res, next) {
    console.log("logging out".red);
    if(req.session) {
        req.session.destroy(function(err) {

            if(!err)
                res.redirect( "/login");

        });
    }
    else
        res.redirect( "/login");

});



router.post('/login', function(req, res, next) {

    console.log("login route");

    if (req.body && req.body.email && req.body.password) {

        var db = req.db.get();
        var collection = db.collection('users');
        var loggedInUser = null;

        collection.find({email: req.body.email}).toArray(function(err, docs) {

            if (!err ) {

                if (docs.length === 0) {
                    req.session.customInfo = "Identifiant et/ou mot de passe incorrect(s)";
                    res.redirect("/");
                }
                else {
                    for (var i = 0; i < docs.length; i++) {
                        if (validPassword(req.body.password, docs[i].password)) {
                            loggedInUser = docs[i];
                            req.session.email = loggedInUser.email;
                            req.session.userId = loggedInUser._id;

                            res.json({ userId: loggedInUser._id, sessionId: req.session.id});

                            break;
                        }
                    }

                    if (!loggedInUser) {
                        req.session.customInfo = "Identifiant et/ou mot de passe incorrect(s)";
                        res.redirect("/");
                    }

                    
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
    findSession(req.query.sessionId, req.db, function(session) {
        if (session) {

            res.json({ success: "access granted"});
        }
        else {
            res.json({ error: "access denied"});
        }
    });

    
});


router.get('/:id', function(req, res, next) {
    console.log("get user by id");

    var db = req.db.get();
    var collection = db.collection('users');

    var mongo = require('mongodb');

    collection.findOne({_id: new mongo.ObjectId(req.params.id)}, {fields: {firstname: 1, lastname: 1, email: 1}}, function(err, doc) {

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

    if (req.body && req.body.userId && req.body.sessionId) {

        findSession(req.body.sessionId, req.db, function(session) {
            if (session) {

                var db = req.db.get();
                var collection = db.collection('users');
                var mongo = require('mongodb');

                collection.findOneAndUpdate({
                    _id: new mongo.ObjectId(req.body.userId)
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
        res.joson({
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

var findSession = function(sessionId, database, callback) {

    var db = database.get();
    var collection = db.collection('sessions');

    collection.find({_id: sessionId}).toArray(function(err, docs) {
        if (!err) {

            if (docs.length > 0) {
                callback(docs[0]);
            }
            else {
                callback(null);
            }
        }
        else
            callback(null);
    });


};


module.exports = router;