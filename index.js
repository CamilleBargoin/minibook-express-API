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

// var port = normalizePort(process.env.PORT || '3000');
app.set('port', process.env.PORT || '3000');

// var server = app.listen("3001");
var server = require('http').createServer(app);
var io      = require('socket.io').listen(server);

app.use(cookieParser());

// io.on("connection", function(socket) {
//         console.log("NOUVELLE CONNEXION");

//         io.set('transports', [            // all transports (optional if you want flashsocket)
//             'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
//         ]);
//         io.set('origins', 'http://minibook-react.herokuapp.com');
// });


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


var users = require('./routes/users')(io);
var messages = require('./routes/messages');
var posts = require('./routes/posts');
var quotes = require('./routes/quotes');



var startServer = function() {

  console.log("start server");

    app.use(function(req, res, next) {
      // res.header("Access-Control-Allow-Origin", "http://localhost:8080");
      // res.header("Access-Control-Allow-Origin", "https://minibook-react.herokuapp.com");
      res.header("Access-Control-Allow-Origin", "http://minibook-react.herokuapp.com");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header('Access-Control-Allow-Credentials', 'true');
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