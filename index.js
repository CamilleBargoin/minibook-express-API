var express = require('express');
var database = require('./database.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');



//
// SESSIONS
//

var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// var sessionFileStore = require('session-file-store');
// var ExpressSessionFileStore = sessionFileStore(session);

// var fileStore = new ExpressSessionFileStore({
//   ttl:3600,
//   path:'./sessions'
// });

var app = express();



app.use(cookieParser());


app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




//var urlDatabase = 'mongodb://localhost:27017/todos';
var urlDatabase =  'mongodb://minibook:123456@ds023373.mlab.com:23373/minibook';

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;


database.connect(urlDatabase, function(err) {
  if (err) {
    console.log('Impossible de se connecter à la base de données.'.red);
    console.log(err);
    process.exit(1);
  }
  else {
    console.log("Connected correctly to mongo server".green);
    startServer();
  }
});


var users = require('./routes/users');



var startServer = function() {

  console.log("start server");

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "http://localhost:8080");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });


    app.use(session({
      secret: '1a9b829823448061ed5931380efc6c6a',
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({
        db: database.get(),
        ttl: 60 * 60
      })
    }));

    app.use(function (req, res, next) {

      console.log(database);
      req.db = database;
      // req.session = session;
      next();
    });





    app.use('/users', users);


    app.get('/getTasks', function(req, res){
     
        res.set('Content-Type', 'application/json');

        var db = database.get();
        var collection = db.collection("tasks");

        collection.find({}).toArray(function(err, docs) {
            if (!err) {
                res.json(JSON.stringify(docs));
            }
        });
    });

    app.post('/createTask', function(req, res) {

        res.set('Content-Type', 'application/json');

        var db = database.get();
        var collection = db.collection("tasks");

        var newTask = req.body;

        collection.insertOne({
              label: newTask.label,
              isCompleted: newTask.isCompleted
          }, function(err, result) {

            if (err)
              console.log(err);
            else {
              res.json(JSON.stringify(result.insertedId));
            }
          });
    });


  app.post('/updateTask', function(req, res) {

        res.set('Content-Type', 'application/json');

        var db = database.get();
        var collection = db.collection("tasks");
        var mongo = require('mongodb');

        var newTask = req.body;

        console.log(newTask._id);

        collection.findOneAndUpdate({
              _id: new mongo.ObjectId(newTask._id)
          }, {
            $set: {
              label: newTask.label,
              isCompleted: newTask.isCompleted
            }
          }, {
            returnOriginal: false
          }, function(err, result) {

            if (err)
              console.log(err);
            else {
              res.json(JSON.stringify(result));
            }
          });
    });

    app.post('/deleteTask', function(req, res) {

        res.set('Content-Type', 'application/json');

        var db = database.get();
        var collection = db.collection("tasks");
        var mongo = require('mongodb');

        var task = req.body;


        collection.findOneAndDelete({
              _id: new mongo.ObjectId(task._id)
          }, function(err, result) {

            if (err)
              console.log(err);
            else {
              res.json(JSON.stringify(result));
            }
          });
    });




    

    app.use(function(err, req, res, next){
      console.log('Error : ' + err.message);
      next();
    });





    app.listen(app.get('port'), function(){
      console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate');
    });

};