var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/matches-so-far', function(req, res) {
  res.send({
    matchedNames: ['Austin', 'Jordan', 'Ben'],
    foundEmail: false,
  });
});

app.listen(3000, function() {
  console.log('app listening on port 3000');
});
