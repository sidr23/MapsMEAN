var express = require('express');
var User = require('./app/models/user'); // get the USER model
var path = require('path');
var passport	= require('passport');

const apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function (req, res) {
    User.createUser(req, function (err, response) {
        console.log(response);
        if (err) {
            console.log(err);
            res.status(err.status);
            res.send(err.body);
        } else {
            res.status(response.status);
            res.send(response.body);
        }
    });

});

apiRoutes.post('/login', function (req, res) {
    User.logIn(req, function (err, response) {
        console.log(response);
        if (err) {
            console.log(err);
            res.status(err.status);
            res.send(err.body);
        } else {
            res.status(response.status);
            res.send(response.body);
        }
    });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    User.memberInfo(req, function (err, response) {
        console.log(response);
        if (err) {
            console.log(err);
            res.status(err.status);
            res.send(err.body);
        } else {
            res.status(response.status);
            res.send(response.body);
        }
    });
});

module.exports = apiRoutes;
