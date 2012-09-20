var conf = require('./../config'),
    _ = require('underscore');

module.exports = function Worker(util, events) {
  events.call(this);

  // ---
  // PUBLIC FUNCTIONS
  // ---

  this.check_tumblr = function(data){
    this.emit('check_tumblr', data);
  };


  // ---
  // PRIVATE FUNCTIONS
  // ---

  var _check_tumblr = function(data){

    // fetch latest 20 posts
    data.tumblog.photo({limit: 20}, function(err, response){
      if(err){
        console.log(err);
      } else {
        var result = _.map(response.posts, function(post){
          return post;
        });
        console.log(result);
      }
    });


    console.log('checking tumblr for new entries');
  };


  // ---
  // LISTENERS
  // ---

  this.on('check_tumblr', _check_tumblr);

};