var express = require('express'),
    mongodb = require('mongodb'),
    util = require('util'),
    events = require('events').EventEmitter,
    Worker = require('./lib/worker'),
    Tumblr = require('tumblr').Tumblr,
    config = require('./config');

// ---
// Initialize the EventEmitter based Worker
// ---

util.inherits(Worker, events);
var worker = new Worker(util, events);

// ---
// MongoDB Configuration
// ---

var items_collection = null;

mongodb.connect(config.mongodb, function(err, connection){
  connection.collection('items', function(err, collection){
    items_collection = collection;
    console.log('database connection established successfully.');
  });
});


// ---
// Tumblr Configuration
// ---

var tumblog = new Tumblr(config.tumblr.subdomain + '.tumblr.com', config.tumblr.api_key);

// ---
// Application
// ---

var app = express.createServer(express.logger());

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// ---
// Routes
// ---

app.get('/', function(req, res) {

  if(req.headers && req.headers['user-agent'] && req.headers['user-agent'] === 'Pingdom.com_bot_version_1.4_(http://www.pingdom.com)'){
    worker.check_tumblr({
      request: req,
      response: res,
      items_collection: items_collection,
      tumblog: tumblog
    });
  }

  res.sendfile('public/index.html');
});

app.get('/check', function(req, res){
  worker.check_tumblr({
    request: req,
    response: res,
    items_collection: items_collection,
    tumblog: tumblog
  });
});

app.get('/items_meta', function(req, res){
  items_collection.find({}).count(function(err, coll_count){
    res.send({count: coll_count});
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});


////////// DOWNLOAD & CONVERT SAMPLE //////////

// var easyimage = require('easyimage'),
//     request = require('request'),
//     fs = require('fs'),
//     util = require('util'),
//     knox = require('knox'),
//     _ = require('underscore'),
//     ExifImage = require('exif').ExifImage;

// var client = knox.createClient({
//   key: config.aws.key,
//   secret: config.aws.secret,
//   bucket: config.aws.bucket
// });

// // FETCH IMAGE
// request({uri: 'http://24.media.tumblr.com/tumblr_m3qzl4kDe41r6f6iuo1_1280.jpg', encoding: 'binary'}, function(error, response, body){
//   if(error){
//     console.log(error);
//   } else {

//     // SAVE IMAGE TO DISK
//     fs.writeFile('image.jpg', body, "binary", function(err){
//       if(err){
//         console.log(err);
//       } else {
//         console.log('image saved to disk');

//         // CROP IMAGE
//         easyimage.thumbnail({
//           src: 'image.jpg',
//           dst: './image_thumbnail.jpg',
//           width: 300,
//           height: 300
//         }, function(err, image){

//           // UPLOAD IMAGE TO S3
//           client.putFile('image_thumbnail.jpg', '/image_thumbnail.jpg', function(err, res){
//             if(err){
//               console.log(err);
//             } else {
//               console.log('thumbnail uploaded successfully');
              
//               // EXTRACT EXIF INFORMATION
//               new ExifImage({image: 'image.jpg'}, function(error, image){
//                 if(error){
//                   console.log(error);
//                 } else {

//                   // CLEAN UP EXIF OBJECT BY REMOVING THE BUFFERS & TRANSFORMING THE ARRAYS INTO A HASH
//                   var imageExif = {};
//                   var globalKeys = ['image', 'exif', 'gps'];

//                   _.each(globalKeys, function(globalKey){
//                     _.each(image[globalKey], function(obj){

//                       var keys = _.keys(obj);

//                       _.each(keys, function(key){
//                         if(Buffer.isBuffer(obj[key])){
//                           delete obj[key];
//                         }
//                       });

//                       imageExif[obj.tagName] = obj;
//                       delete imageExif[obj.tagName].tagName;
//                     });
//                   });

//                   fs.writeFileSync('image.json', JSON.stringify(imageExif), 'utf8');

//                   console.log(imageExif);

//                   // SAVE METADATA INTO THE DATABASE
//                   // --> TODO

//                 }
//               });

//               // EXTRACT EXIF WITH IMAGEMAGICK
//               im.readMetadata('image.jpg', function(err, metadata){
//                 if (err) throw err;
//                 console.log(metadata.exif);
//                 // console.log('Shot at '+metadata.exif.dateTimeOriginal);
//               })
              
//             }
//           });

//         });


//       }
//     });
//   }
// });