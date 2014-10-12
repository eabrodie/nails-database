'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var mongod = require('mongod');

var app = express();
var db = mongod(process.env.DB, ['users']);


app.set('views', __dirname + '/views');
app.engine('jade', require('jade').renderFile);


passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(user, done){
  done(null, user);
});
passport.use('local', new LocalStrategy(function(email, password, done){
  db.users.findOne({_id: email}).done(function(user){
    if (!user) return done(null, false, {message: 'Incorrect'});
    bcrypt.compare(password, user.passwordHash, function(err, match) {
      if (err) return done(err);
      if (match) return done(null, {email: email});
      else done(null, false, {message: 'Incorrect'});
    });
  }, done);
}));

app.use(session({keys: ['hhdhdjk5uh298tyhsknfkjwh48rh4j']}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res, next){
  if (req.isAuthenticated()) {
    res.render('index.jade');
  } else {
    res.render('login.jade');
  }
});

app.post('/signup', function(req, res, next){
  bcrypt.hash(req.body.password, 10, function(err, hash){
    if (err) return next(err);
    db.users.insert({_id: req.body.username, passwordHash: hash}).done(function(){
      res.send('Registered');
    }, next);
  });
});

app.post('/login', passport.authenticate('local', {successRedirect: '/'}));

app.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

app.listen(3000);