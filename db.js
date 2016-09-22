var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/namegame');

var db = mongoose.connection;

module.exports = {
  updateUser: function (email, field, value, callback) {
    callback('database not ready');
  }
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  var userSchema = mongoose.Schema({
    email: String,
    gender: String,
    lastName: String,
    matches: [String],
    mommyLikes: [String],
    daddyLikes: [String],
  });
  User = mongoose.model('User', userSchema);
  // update a user value
  module.exports.updateUser = function(email, field, value, callback) {
    var update = {};
    update[field] = value;
    User.findOneAndUpdate(
      { email: email }, // query
      update, // update
      { upsert: true }, // options
      function (error, result) {
        if(!error) {
          if(!result) {
            result = new User();
          }
        }
        result.save(function(error) {
          if(!error) {
            callback();
          } else {
            callback('failed to save to db');
          }
        })
      }
    );
  };
  module.exports.getUser = function(email, callback) {
    User.findOne({ email: email }, callback);
  };
});
