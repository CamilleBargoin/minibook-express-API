var express = require('express');
var database = require('./database.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var Mailgun = require('mailgun-js');



//
// SESSIONS
//

var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();



app.use(cookieParser());


app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));






//var urlDatabase = 'mongodb://localhost:27017/todos';
var urlDatabase =  'mongodb://minibook:123456@ds023373.mlab.com:23373/minibook';
mongoose.connect(urlDatabase);


app.use(session({
  secret: '1a9b829823448061ed5931380efc6c6a',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    ttl: 60 * 60 
  })
}));


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Connected correctly to mongo server".green);

  startServer();
});


var users = require('./routes/users');
var posts = require('./routes/posts');



var startServer = function() {

  console.log("start server");

    app.use(function(req, res, next) {
      // res.header("Access-Control-Allow-Origin", "http://localhost:8080");
      res.header("Access-Control-Allow-Origin", "https://minibook-react.herokuapp.com");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });


    app.use(function (req, res, next) {

      console.log(database);
      req.db = database;
      // req.session = session;
      next();
    });



    app.use('/users', users);
    app.use('/posts', posts);

    app.get('/', function (req, res) {
      res.send('Hello World!');
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