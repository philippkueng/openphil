var conf = require('./../config');

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

    // fetch latest 20 posts. 
    // -> in case all are not yet in the database then go for 100 posts and check. // ugly but should be working.


    console.log('checking tumblr for new entries');
  };


  // ---
  // LISTENERS
  // ---

  this.on('check_tumblr', _check_tumblr);

};