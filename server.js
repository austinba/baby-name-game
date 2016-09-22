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

app.post('/love-name', function(req, res) {
  var email = req.body.email;
  console.log(req.body);
  db.getUser(email,
    function(err, user) {
      if(err) {
        res.status(500).send('problem with database');
      } else {
        var parent = req.body.parent === 'mommy' ? 'mommy' : 'daddy';
        var field = parent === 'mommy' ? 'mommyLikes' : 'daddyLikes';
        var otherParentField = parent === 'mommy' ? 'daddyLikes' : 'mommyLikes';
        var name = req.body.name;
        var gender = req.body.gender;

        // check if not already recorded as a 'love name'
        if ((user[field] || []).filter(function(val) { // we want to track regardless if added to matches
          return val.name === name && val.gender === gender;
        }).length === 0) {

          // if current parent doesn't already like this name, add to this parent
          var update = {};
          update[field] = { name: name, gender: gender };
          db.updateUser(email, '$push', update, function(error) {

            // check if this resulted in a match
            if((user[otherParentField] || []).filter(function(val) {
              return val.name === name && val.gender === gender;
            }).length > 0) {
                // if the other parent likes this name, add to matches
                var update = { matches: { name: name, gender: gender } };
                db.updateUser(email, '$push', update, function(error) {
                  if(error) res.status(500).send({ error: 'error saving match' });
                  else res.send({ matchFound: true, name: name, gender : gender });
                });
            } else {
              if(error) res.status(500).send({ error: 'error saving match' });
              else res.send({ message: 'Saved to db' });
            }
          });
        } else {
          res.send({ message: 'Already loved this name' });
        }
      }
    })
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
  var count = Math.min(parseInt(req.body.count) || 1, 100);
  var namesToSend = Array.apply(null, Array(count)).map(function() {
    return girlNames[Math.floor(Math.random() * girlNames.length)];
  });
  res.send({
    names: namesToSend
  });
});

app.get('/boy-names', function(req, res) {
  var count = Math.min(parseInt(req.body.count) || 1, 100);
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
