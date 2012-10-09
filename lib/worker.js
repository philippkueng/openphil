var conf = require('./../config'),
    request = require('request'),
    fs = require('fs'),
    im = require('imagemagick'),
    async = require('async'),
    _ = require('underscore'),
    mongodb = require('mongodb'),
    moment = require('moment');

module.exports = function Worker(util, events) {
  events.call(this);

  var items_collection = null;
  mongodb.connect(conf.mongodb, function(err, connection){
    connection.collection('items', function(err, collection){
      items_collection = collection;
      console.log('database connection to items collection established');
    });
  });

  // ---
  // PUBLIC FUNCTIONS
  // ---

  this.check_tumblr = function(data){
    this.emit('check_tumblr', {data: data, offset: 0});
    data.response.send("thanks. checking...");
  };

  this.items_meta = function(data){
    items_collection.find({}).count(function(err, coll_count){
      data.response.send({count: coll_count});
    });
  };

  this.weight = function(data){
    
    // db.items.find({tags:{$in:["weight"]}}).sort({slug:-1}).limit(28) - mongo CLI query
    items_collection.find({tags:{$in:["weight"]}}, {sort:{weight_date:-1}, limit:28}).toArray(function(err, docs){
      data.response.json(_.map(docs, function(doc){
        return {
          weight: doc.weight,
          date: doc.weight_date
        }
      }));
    });
  };

  // ---
  // PRIVATE FUNCTIONS
  // ---

  var process_post = function(post, callback){
    async.waterfall([
      function fetch_original_image(callback){
        request({
          uri: post.photos[0].original_size.url,
          encoding: 'binary'
        }, callback);
      },
      function write_file(response, body, callback){
        fs.writeFile(post.id + '.jpg', body, 'binary', callback);
      },
      function extract_exif(callback){
        im.readMetadata(post.id + '.jpg', callback);
      },
      function insert_into_items_collection(metadata, callback){
        post.metadata = metadata;

        // if post has tag weight, extract the data.
        if(_.include(post.tags, 'weight')){
          var caption = post.caption;
          caption = caption.replace('<p>','');
          caption = caption.replace('kg</p>','');
          caption = caption.replace(/&#160;/g,'');
          caption = caption.replace(' ','');
          var caption_arr = caption.split(':');
          post.weight = caption_arr[1];
          post.weight_date = caption_arr[0];

          var date_taken = moment(post.weight_date);
          post.day_of_week_taken = date_taken.day();

          // DEBUG
          console.log(caption_arr);
        }

        items_collection.insert(post, callback);
      },
      function delete_file(doc, callback){
        fs.unlink(post.id + '.jpg', callback);
      }
    ], function(err, result){
      if(err){
        callback(err, null);
      } else {
        console.log('finished processing post ' + post.id);
        callback(null, result);
      }
    });
  };

  var does_item_exist = function(post, callback){
    items_collection.find({id: post.id}).count(function(err, coll_count){
      if(coll_count > 0){
        callback(true); // item already exists in the db.
      } else {
        callback(false); // item is new and needs processing.
      }
    });
  };



  /*
   * Checks tumblr for the latest 10 entries.
   * - in case not all 10 are already in the database it fetched the previously latest 10 posts.
   *
   */

  var _check_tumblr = function(data){
    var that = this;

    console.log('offset: ' + data.offset);

    data.data.tumblog.photo({limit: 10, offset: data.offset}, function(err, response){
      if(err){
        console.log('starting the log --------');
        console.log(err);
        console.log('error: ending the log <check_tumblr> --------');
      } else {

        async.every(response.posts, does_item_exist, function(result){
          if(!result){ // not all of those 10 posts are new, fetch further.

            // process the current batch of 10 posts.
            for(i = 0; i < response.posts.length; i++){
              that.emit('process_image', {
                data: data.data,
                post: response.posts[i]
              });
            }

            setTimeout(function(){
              that.emit('check_tumblr', {data: data.data, offset: data.offset + 10});
            }, 10000);
          }
        });


      }
    });
  };


  var _process_image = function(data){
    var that = this;

    does_item_exist(data.post, function(result){
      if(!result){ 
        process_post(data.post, function(err, result){
          if(err){
            console.log('starting the log --------');
            console.log('failed fetching from ' + data.post.photos[0].original_size.url);
            console.log(err);
            console.log('error: ending the log <_process_image> --------');

            // retry
            setTimeout(function(){
              that.emit('process_image', data);
            }, 5000);
          }
        });
      }
    });

    // fetch image
    // save image to disk
    // crop image
    // upload image to s3
    
  };


  // ---
  // LISTENERS
  // ---

  this.on('check_tumblr', _check_tumblr);
  this.on('process_image', _process_image);

};