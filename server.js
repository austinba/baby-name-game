var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var boyNames = (fs.readFileSync('names/boy').toString() || '').split('\n');
var girlNames = (fs.readFileSync('names/girl').toString() || '').split('\n');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/matches-so-far', function(req, res) {
  res.send({
    matchedNames: ['Austin', 'Jordan', 'Ben'],
    foundEmail: true,
    lastName: 'Baltes',
    gender: 'boy',
  });
});

app.post('/last-name', function(req, res) {
  console.log(req.body.email, req.body.lastName);
  res.send('Received last name');
});
app.post('/gender', function(req, res) {
  console.log(req.body.email, req.body.gender);
  res.send('Received gender');
});

app.get('/girl-names', function(req, res) {
  var count = Math.min(parseInt(req.query.count) || 1, 100);
  var namesToSend = Array.apply(null, Array(count)).map(function() {
    return girlNames[Math.floor(Math.random() * girlNames.length)];
  });
  res.send({
    names: namesToSend
  })
});

app.get('/boy-names', function(req, res) {
  var count = Math.min(parseInt(req.query.count) || 1, 100);
  var namesToSend = Array.apply(null, Array(count)).map(function() {
    return boyNames[Math.floor(Math.random() * boyNames.length)];
  });
  res.send({
    names: namesToSend
  })
});


app.listen(3000, function() {
  console.log('app listening on port 3000');
});
