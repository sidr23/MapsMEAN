var UserDAO = require('../schema/user');
var Search = require('../schema/search');
var MongoClient = require('mongodb').MongoClient;
var config = require('../../config/database');
var jwt         = require('jwt-simple');
function getResponse() {
    return {
        'status': 200,
        'body': {}
    };
}

function isEmail(email) {
    if (email.length == 0) {
        return false;
    } else {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}

function isStrongPwd(pwd) {
    return true;
}

module.exports.createUser = function (req, callback) {
    var res = getResponse();
    if (!req.body.password || !req.body.email) {
        res.status = 400;
        res.body.message = "Please pass name and password.";
        callback(res);
    } else {
        var email = req.body.email.toLowerCase();
        var password = req.body.password;
        if (!isEmail(email)) {
            res.status = 400;
            res.body.message = "Bad Request: Invalid Email address";
            callback(res);
        } else if (!isStrongPwd(password)) {
            res.status = 400;
            callback(res);
        } else {

            var newUser = new UserDAO({
                email: email,
                password: req.body.password,
                searches: []
            });
            newUser.save(function (err) {
                if (err) {
                    console.log('error', err);
                    console.log(err);
                    if (err.code == 11000) {
                        res.status = 409;
                        res.body.message = "email address has been used.";
                        callback(res);
                    } else {
                        res.status = 500;
                        res.body.message = "Internal Error: ";
                        callback(res);
                    }
                } else {
                    res.status = 200;
                    res.body.message = "Successfully created new user ";
                    UserDAO.findOne({email: email}, function (err, data) {
                        res.body.userid = data._id;
                        callback(null, res);
                    });
                }
            });
        }
    }
}

module.exports.logIn = function (req, callback) {
    console.log("Entering function login");
    var res = getResponse();
    UserDAO.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            console.log(err);
            res.status = 500;
            res.body.message = 'Internal Error: ';
            callback(res);
        } else if (!user) {
            res.status = 404;
            res.body.message = 'Authentication failed. User not found.';
            callback(res);
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.status = 200;
                    res.body.message = "Login successful";
                    res.body.userid = user._id;
                    res.body.token = "JWT " + token;
                    callback(null, res);
                } else {
                    res.status = 401;
                    res.body.message = 'Authentication failed. Wrong password.';
                    callback(res);
                }
            });
        }
    });
}


module.exports.memberInfo = function (req, callback) {
    console.log("Entering function memberinfo");
    var res = getResponse();

    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        UserDAO.findOne({
            email: decoded.email
        }, function(err, user) {
            if (err) {
                console.log(err);
                res.status = 500;
                res.body.message = 'Internal Error: ';
                callback(res);
            }
            else if (!user) {
                res.status = 404;
                res.body.message = 'Authentication failed. User not found.';
                callback(res);
            }
            else {
                res.status = 200;
                res.body.message = "Welcome in the member area " + user.email;
                callback(null, res);
            }
        });
    }
    else {
        res.status = 403;
        res.body.message = 'No token provided.';
        callback(res);
    }
}

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};