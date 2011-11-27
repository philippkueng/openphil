/**
 * requires & definitions
 */
require('../db/schema');
var fs = require('fs'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://localhost/eatingstats'),
    Items = db.model('Items'),
    Step = require('step');


/**
 * global variables
 */
var data_count = [];


/**
 * fetch a day from the database
 */
var fetch_a_day = function(start_date, end_date, callback){
  Items
    .where('important_date').gte(start_date.native())
    .where('important_date').lt(end_date.native())
    .where('keys').nin(['weight'])
    .find(callback);
};


/**
 * fetch weight entries within the date range from the database
 */
var fetch_a_day_weight_entries = function(start_date, end_date, callback){
  Items
    .where('important_date').gte(start_date.native())
    .where('important_date').lt(end_date.native())
    .where('keys').in(['weight'])
    .find(callback);
};


/**
 * process a day -> add it the json file
 */
var process_a_day = function(start_date, callback){
  var day = {};
  var end_date = moment();
  var food_items = false;
  Step(
    function _create_end_date(){
      end_date.year(start_date.year());
      end_date.month(start_date.month());
      end_date.date(start_date.date());
      end_date.hours(start_date.hours());
      end_date.minutes(start_date.minutes());
      end_date.seconds(start_date.seconds());
      end_date.add('days',1).subtract('minutes', 1);
      return end_date;
    },
    function _fetch_a_day(err, end_date){
      fetch_a_day(start_date, end_date, this);
    },
    function _add_to_file(err, results){
      if(err){
        throw err;
      } else {
        if(results.length > 0){
          food_items = true;
          day = {
            date: new Date(start_date.native()),
            count: results.length
          };
          return true;
        } else {
          fetch_weight_entries = false;
          return false;
        }
      }
    },
    function _fetch_weight_for_day(err, result){
      fetch_a_day_weight_entries(start_date, end_date, this);
    },
    function _add_weight_to_file(err, results){
      if(err){
        throw err;
      } else {
        if (results.length > 0){
          day.weight = results[0].weight;
          data_count.push(day);
          return true;
        } else {
          if(day !== null && typeof day !== 'undefined' && food_items){
            data_count.push(day);
          }
          return false;
        }
      }
    },
    function _finish(err, result){
      callback(err, food_items, start_date);
    }
  )
};


/**
 * get the start date -> very beginning of the date given
 */
var start_date = function(current_date){
  var now = moment();
  if(current_date !== null && typeof current_date !== 'undefined'){
    now = current_date;
  }
  return moment([now.year(), now.month(), now.date()]);
};


/**
 * create data file -> management function, gets called recursively
 */
var create_data_file = function(new_start_date){
  var current_start_date = start_date(new_start_date); // in moment format
  
  process_a_day(current_start_date, function(err, result, current_start_date){
    if (err){
      throw err;
    } else {
      if (result){
        create_data_file(current_start_date.subtract('days', 1));
      } else { // no more items retrieved -> reached the beginning
        fs.writeFile('../data/data_count.json', JSON.stringify(data_count), function(err){
          if (err){
            throw err;
          } else {
            console.log('file written to disk');
            mongoose.connection.close();
            process.exit();
          }
        });
      }
    }
  });
};


/**
 * start the script and create the json file
 */
create_data_file()

