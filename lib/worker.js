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
  var dow_stats_collection = null;
  mongodb.connect(conf.mongodb, function(err, connection){
    connection.collection('items', function(err, collection){
      items_collection = collection;
      console.log('database connection to items collection established');
    });

    connection.collection('dow_stats', function(err, collection){
      dow_stats_collection = collection;
      console.log('database connection to dow_stats collection established');
    });
  });

  // ---
  // PUBLIC FUNCTIONS
  // ---

  this.check_tumblr = function(data){
    this.emit('check_tumblr', {data: data, offset: 0});
    this.emit('analyze_data', {data: data});
    data.response.send("thanks. checking...");
  };

  this.items_meta = function(data){
    items_collection.find({}).count(function(err, coll_count){
      data.response.send({count: coll_count});
    });
  };

  this.weight = function(data){
    
    // db.items.find({tags:{$in:["weight"]}}).sort({slug:-1}).limit(28) - mongo CLI query
    items_collection.find({tags:{$in:["weight"]}, diff:{'$exists':true}}, {sort:{weight_date:-1}, limit:28}).toArray(function(err, docs){
      var weight = _.map(docs, function(doc){
        return {
          weight: doc.weight,
          date: doc.weight_date,
          diff: doc.diff
        }
      });

      dow_stats_collection.find({}, {sort:{day_of_week:1}}).toArray(function(err, dow){
        if(err){
          console.log('error while running the find query against the dow_stats collection');
          console.log(err);
        }

        data.response.json({
          weight: weight,
          day_of_week: dow
        }, 200);
      });

      // data.response.json(_.map(docs, function(doc){
      //   return {
      //     weight: doc.weight,
      //     date: doc.weight_date
      //   }
      // }));
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


  var _analyze_data = function(data){
    var that = this;

    // check if number of items in mongoDB == number of posts on tumblr
    data.data.tumblog.info(function(err, result){
      items_collection.count(function(err, count){
        if(result.blog.posts === count){
          console.log('dataset is complete, ready for doing analysis work.');

          // find latest weight entry
          items_collection.find({
            'weight_date': {'$exists': true}
          }).sort({
            'weight_date': -1
          }).limit(1).toArray(function(err, docs){
            if(err){
              console.log('error when fetching the latest weight entry');
              console.log(err);
            } else {
              console.log(docs[0].weight_date);
              that.emit('process_single_weight_entry', docs[0].weight_date);
            }
          });

        } else {
          console.log('not complete yet, checking again in a minute.');
          setTimeout(function(){
            that.emit('analyze_data', data);
          }, 60000);
        }
      })
    });
  };


  var _process_single_weight_entry = function(weight_date){
    var that = this;

    if(weight_date !== '2011-11-17'){
      // item :: is the data from the newer weight entry.
      var newer_date = moment(weight_date);
      var older_date = moment(weight_date).subtract('days', 1);
      var older_date_string = older_date.year() + '-';
      if((older_date.month() + 1) < 10){
        older_date_string += '0' + (older_date.month() + 1) + '-';
      } else {
        older_date_string += (older_date.month() + 1) + '-';
      }

      if(older_date.date() < 10){
        older_date_string += '0' + older_date.date();
      } else {
        older_date_string += older_date.date();
      }

      items_collection.findOne({
        'weight_date': weight_date,
        'diff': {'$exists': false}
      }, function(err, newer_item){
        if(err){
          console.log('error while analyzing data for ' + weight_date);
          console.log(err);
        } else {
          if(newer_item){
            items_collection.findOne({
              'weight_date': older_date_string
            }, function(err, older_item){
              if(err){
                console.log('error while analyzing data for ' + older_date_string);
                console.log(err);
              } else {
                if(older_item){
                  var newer_weight = parseFloat(newer_item.weight);
                  var older_weight = parseFloat(older_item.weight);

                  var diff = newer_weight - older_weight;

                  // set diff - only change property
                  items_collection.update({
                    'weight_date': weight_date
                  }, {
                    '$set': {
                      diff: diff
                    }
                  }, {
                    safe: true
                  }, function(err){
                    if(err){
                      console.log('error while updateing a diff for ' + weight_date);
                      console.log(err);
                    } else {
                      console.log('set diff for ' + weight_date);
                      // go ahead and calculate the diff for the older entry.
                      that.emit('process_single_weight_entry', older_date_string);
                    }
                  });
                } else {
                  // there's no weight entry for that older_date. Go and process date -1.
                  that.emit('process_single_weight_entry', older_date_string);
                }
              }
            });
          } else {
            // there's no weight entry for that date. Go and process date -1.
            that.emit('process_single_weight_entry', older_date_string);
          }
        }
      });
    } else {
      console.log('reached 2011-11-17 stop updating diffs now');

      for(var i = 0; i < 7; i++){
        that.emit('create_stats_for_day', i);
      }

      // sunday - day_of_week_taken = 0
      // that.emit('create_stats_for_day', 0);
    }
  };

  var _create_stats_for_day = function(day_of_week){
    var that = this;

    items_collection.find({'diff':{'$exists':true}, 'day_of_week_taken':day_of_week}).toArray(function(err, items){
      if(err){
        console.log('error while fetching all the entries for day_of_week ' + day_of_week);
        console.log(err);
      } else {

        // calculate average
        var average = _.reduce(items, function(memo, item){ return memo + item.diff; }, 0) / items.length;
        console.log('average (' + day_of_week + '): ' + average);

        // find maximum
        var maximum = _.max(items, function(item){ return item.diff; });
        console.log('maximum (' + day_of_week + '): ' + maximum.diff);

        // find minimum
        var minimum = _.min(items, function(item){ return item.diff; });
        console.log('minimum (' + day_of_week + '): ' + minimum.diff);

        // check if there's already an entry for this day in the stats collection
        dow_stats_collection.findOne({'day_of_week': day_of_week}, function(err, day_doc){
          if(err){
            console.log('error while fetching a stats entry for day_of_week: ' + day_of_week);
            console.log(err);
          } else {
            if(day_doc){ // document already exists, so only update attributes
              dow_stats_collection.update({
                'day_of_week': day_of_week
              }, {
                '$set': {
                  'average': average,
                  'maximum': maximum.diff,
                  'minimum': minimum.diff,
                  'count': items.length,
                  'updated_at': new Date()
                }
              }, {
                safe: true
              }, function(err){
                if(err){
                  console.log('error while updating the stats entry for day_of_week: ' + day_of_week);
                  console.log(err);
                } else {
                  console.log('updated entry for day_of_week: ' + day_of_week);
                }
              });
            } else { // document doesn't exist so create a new one
              dow_stats_collection.insert({
                'day_of_week': day_of_week,
                'average': average,
                'maximum': maximum.diff,
                'minimum': minimum.diff,
                'count': items.length,
                'updated_at': new Date()
              }, function(err){
                if(err){
                  console.log('error while inserting the stats entry for day_of_week: ' + day_of_week);
                  console.log(err);
                } else {
                  console.log('inserted entry for day_of_week: ' + day_of_week);
                }
              });
            }
          }
        });
      }
    });
  };


  // ---
  // LISTENERS
  // ---

  this.on('check_tumblr', _check_tumblr);
  this.on('process_image', _process_image);
  this.on('analyze_data', _analyze_data);
  this.on('process_single_weight_entry', _process_single_weight_entry);
  this.on('create_stats_for_day', _create_stats_for_day);

};