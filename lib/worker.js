var conf = require('./../config'),
    request = require('request'),
    fs = require('fs'),
    im = require('imagemagick'),
    _ = require('underscore');

module.exports = function Worker(util, events) {
  events.call(this);

  // ---
  // PUBLIC FUNCTIONS
  // ---

  this.check_tumblr = function(data){
    this.emit('check_tumblr', data);
    data.response.send("thanks. checking...");
  };


  // ---
  // PRIVATE FUNCTIONS
  // ---

  /*
   * Checks tumblr and checks for 20 entries wether all of them are in the database.
   *
   */

  var _check_tumblr = function(data){
    var that = this;

    data.tumblog.photo({limit: 20}, function(err, response){
      if(err){
        console.log('starting the log --------');
        console.log(err);
        console.log('error: ending the log <check_tumblr> --------');
      } else {

        for(i = 0; i < response.posts.length; i++){
          that.emit('check_for_post_in_db', {
            data: data, 
            post: response.posts[i]
          });
        }
      }
    });
  };


  var _check_for_post_in_db = function(data){
    var that = this;

    data.data.items_collection.find({id: data.post.id}).count(function(err, coll_count){
      if(coll_count == 0){
        console.log('post is not yet in the database.');
        that.emit('process_image', data);
      } else {
        console.log('post is already in database.');
      }
    });
  }


  var _process_image = function(data){
    var that = this;

    that.emit('fetch_original_image', data);

    // fetch image
    // save image to disk
    // crop image
    // upload image to s3
    
  };


  var _fetch_original_image = function(data){
    var that = this;

    request({uri: data.post.photos[0].original_size.url, encoding: 'binary'}, function(err, response, body){
      if(err){
        console.log('starting the log --------');
        console.log(err);
        console.log('error: ending the log for <fetch_original_image> --------');
      } else {

        fs.writeFile(data.post.id + '.jpg', body, 'binary', function(err){
          if(err){
            console.log('starting the log --------');
            console.log(err);
            console.log('error: ending the log for <fetch_original_image> when writing the file --------');
          } else {

            that.emit('extract_exif_info', data);
          }
        });
      }
    });
  };


  var _extract_exif_info = function(data){
    var that = this;

    im.readMetadata(data.post.id + '.jpg', function(err, metadata){
      if(err){
        console.log('starting the log --------');
        console.log(err);
        console.log('error: ending the log for <extract_exif_info> --------');
      } else {
        data.post.metadata = metadata;
        that.emit('insert_into_items_collection', data);
      }
    });
  };


  var _insert_into_items_collection = function(data){
    var that = this;

    data.data.items_collection.insert(data.post, function(err, doc){
      if(err){
        console.log('starting the log --------');
        console.log(err);
        console.log('error: ending the log for <insert_into_items_collection> --------');
      } else {
        console.log('saved post ' + data.post.id);
      }
    });
  };

  // ---
  // LISTENERS
  // ---

  this.on('check_tumblr', _check_tumblr);
  this.on('check_for_post_in_db', _check_for_post_in_db);
  this.on('process_image', _process_image);
  this.on('fetch_original_image', _fetch_original_image);
  this.on('extract_exif_info', _extract_exif_info);
  this.on('insert_into_items_collection', _insert_into_items_collection);

};