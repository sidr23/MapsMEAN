var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8081;
var routes      = require('./routes');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// connect to database
mongoose.connect(config.database.uri, function(error){
    if( error ) {
        console.log(err)
    }
});

// pass passport for configuration
require('./config/passport')(passport);


// connect the api routes under /api/vi/*
app.use('/api', routes);


//Start HTTP server
var http = require('http');
http.createServer(app).listen(port);
console.log('API hosted on: http://localhost:' + port);