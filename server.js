var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var db = require('./db');

var boyNames = (fs.readFileSync('names/boy').toString() || '').split('\n');
var girlNames = (fs.readFileSync('names/girl').toString() || '').split('\n');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/matches-so-far', function(req, res) {
  db.getUser(req.query.email,
    function(err, user) {
      if(err) {
        res.status(500).send('problem retrieving from database');
      } else if(user) {
        res.send({
          matchedNames: (user.matches || []),
          foundEmail: true,
          lastName: (user.lastName || ''),
          gender: (user.gender || 'boy'),
        });
      } else {
        res.send({
          foundEmail: false,
          matchedNames: [],
          lastName: '',
          gender: 'boy',
        });
      }
  });
});

app.post('/last-name', function(req, res) {
  db.updateUser( req.body.email, 'lastName', req.body.lastName, function(error) {
    console.log('saving last name');
    if(error) res.status(500).send(error);
    else res.send('Saved to db');
  });
});
app.post('/gender', function(req, res) {
  db.updateUser( req.body.email, 'gender', req.body.gender, function(error) {
    if(error) res.status(500).send(error);
    else res.send('Saved to db');
  });
});

app.get('/girl-names', function(req, res) {
  var count = Math.min(parseInt(req.query.count) || 1, 100);
  var namesToSend = Array.apply(null, Array(count)).map(function() {
    return girlNames[Math.floor(Math.random() * girlNames.length)];
  });
  res.send({
    names: namesToSend
  });
});

app.get('/boy-names', function(req, res) {
  var count = Math.min(parseInt(req.query.count) || 1, 100);
  var namesToSend = Array.apply(null, Array(count)).map(function() {
    return boyNames[Math.floor(Math.random() * boyNames.length)];
  });
  res.send({
    names: namesToSend
  });
});


app.listen(3000, function() {
  console.log('app listening on port 3000');
});
