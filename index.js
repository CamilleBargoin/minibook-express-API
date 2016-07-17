var express = require('express');
var database = require('./database.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');


//
// SESSIONS
//

var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();




// var port = normalizePort(process.env.PORT || '3000');
app.set('port', process.env.PORT || '3000');

// var server = app.listen("3001");
// var server = require('http').createServer(app);
// var io      = require('socket.io')(server);
var port = process.env.PORT || 3000;
var io = require('socket.io').listen(app.listen(app.get('port'), function(){
      console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate');
    }));
 

// io.on('connection', function (socket) {
// console.log(" CA MARCHE");

// });
 
app.use(cookieParser());

// io.set('origins', '*:*');
// io.set('match origin protocol', true);

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



var urlDatabase =  'mongodb://minibook:123456@ds023373.mlab.com:23373/minibook';
mongoose.connect(urlDatabase);


app.use(session({
  secret: '1a9b829823448061ed5931380efc6c6a',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    ttl: 60 * 60 *2
  })
}));


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Connected correctly to mongo server".green);

  startServer();
});


var users = require('./routes/users')(io);
var messages = require('./routes/messages');
var posts = require('./routes/posts');
var discussions = require('./routes/discussions');
var quotes = require('./routes/quotes');



var startServer = function() {

  console.log("start server");
console.log(process.env);

    app.use(function(req, res, next) {
      if (process.env.NODE_ENV) {
        res.header("Access-Control-Allow-Origin", "http://minibook-react.herokuapp.com");
      }
      else {
        res.header("Access-Control-Allow-Origin", "http://localhost:8080");
      }
      // res.header("Access-Control-Allow-Origin", "http://minibook-react.herokuapp.com");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Allow-Credentials", 'true');
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
    app.use('/messages', messages);
    app.use('/quotes', quotes);
    app.use('/discussions', discussions);


    app.get('/', function (req, res) {
      res.send('Hello World!');
    });


    app.use(function(err, req, res, next){
      console.log('Error : ' + err.message);
      next();
    });


    // app.listen(app.get('port'), function(){
    //   console.log('Express started on http://localhost:' +
    //     app.get('port') + '; press Ctrl-C to terminate');
    // });

};