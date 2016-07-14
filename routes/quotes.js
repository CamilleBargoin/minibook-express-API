var express = require('express');
var router = express.Router();
var quotesModel = require("../models/quotes");



router.get("/all", function(req, res, next) {

    console.log("get all quotes");

    
        quotesModel.find({}, function(err, docs) {

            if (!err ) {

                res.json({quotes: docs});   
            }
            else {
                console.log(err);
                res.json({
                    error: "impossible de récupérer les quotes"
                });
            }
        });
});

router.get("/random", function(req, res, next) {

    console.log("get random quote");
    
    quotesModel.random(function(err, doc) {

            if (!err ) {

                res.json({quote: doc.text});   
            }
            else {
                console.log(err);
                res.json({
                    error: "impossible de récupérer la quote"
                });
            }
        });
});

module.exports = router;