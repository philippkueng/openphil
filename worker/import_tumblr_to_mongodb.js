var config = require('../config'),
    Step = require('step'),
    Tumblr = require('tumblr').Tumblr,
    blog = new Tumblr(config.tumblr.subdomain + '.tumblr.com', config.tumblr.api_key);
    
var util = require('util'),
    exec = require('child_process').exec;
    
var ruby_path = '/Users/philippkueng/.rvm/rubies/ruby-1.9.2-p290/bin/ruby';

// -- MONGODB --

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.ObjectId;
    
mongoose.connect('mongodb://localhost/eatingstats');
    
var ItemsSchema = new Schema({
      post_id: {type: String, index: {unique: true}},
      title: {type: String},
      post_date: {type: Date},
      keys: {type: [String]},
      caption: {type: String},
      post_url: {type: String},
      image_url: {type: String},
      image_height: {type: Number},
      image_width: {type: Number},
      image_date: {type: Date}
    });

var Items = mongoose.model('Items', ItemsSchema); 

// -- process a single item all the way --

var process_item = function(post, callback){
  Step(
    function convert_post_to_item(){
      var item = new Items({
        post_id: post.id.toString(),
        title: post.title,
        keys: post.tags,
        caption: post.caption,
        post_url: post.post_url,
        image_url: post.photos[0].original_size.url
      });
      return item;
    },
    function save_item_to_db(err, item){
      item.save(this);
    },
    function finish_save_to_db(err, item){
      if (err){
        throw err;
        // optional - handling err.code === 11000 differently?
      } else {
        console.log('saved post: ' + item.post_id);
        return item;
      }
    },
    function download_image(err, item){
      var file_url = item.image_url;
      var file_name = item.post_id + '.jpg'
      
      child = exec('/usr/local/bin/wget ' + file_url + ' -O ' + config.system.save_images_in_folder + file_name + ' -nv', this);
    },
    function extract_exif_and_create_thumbnails(err, stderr, stdout){
      child = exec(ruby_path + ' ./process_image.rb ' + post.id.toString(), this);
    },
    function update_result(err, result){
      console.log(err);
      console.log(result);
      callback(err, result);
    }
  );
};

// -- management variables --

var lowest_id = null;
var items_in_tumblr = null;
var items_downloaded = 0;
var current_offset = 0;

// -- fetch posts from tumblr and start processing each of those --

var fetch_photos_from_tumblr = function(){
  Step(
    function fetch_photos(){
      blog.photo({limit: 20, offset: current_offset}, this);
    },
    function process_each_item(err, response){
      var group = this.group();
      var post_counter = 1;
      if(items_in_tumblr === null){ items_in_tumblr = response.blog.posts; }
      items_downloaded += response.posts.length;
      response.posts.forEach(function(post){
        if(post_counter === response.posts.length){
          lowest_id = post.id;
        } else {
          post_counter += 1;
        }
        process_item(post, group());
      });
    },
    function display_results(err, result){
      if(items_downloaded === items_in_tumblr){
        return true;
      } else {
        console.log('lowest_id: ' + lowest_id);
        current_offset += 20;
        fetch_photos_from_tumblr();
      }
    },
    function create_tempjson_from_db(err, stderr, stdout){
      return 'in progress...';
    },
    function replace_current_json_with_tempjson(err, result){
      return 'in progress...';
    },
    function close_connections(err, result){
      console.log('closing connections');
      mongoose.connection.close();
      process.exit();
    }
  );
};

fetch_photos_from_tumblr();

// blog.photo({limit: 20}, function(err, response){
//   console.log(err);
//   // console.log(response);
//   console.log(response.posts[0].photos[0].alt_sizes);
// });



