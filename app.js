var express = require('express'),
    config = require('./config');

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

app.get('/', function(req, res) {

  if(req.headers && req.headers['user-agent'] && req.headers['user-agent'] === 'Pingdom.com_bot_version_1.4_(http://www.pingdom.com)'){
    console.log('request from pingdom');
  }

  res.sendfile('public/index.html');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});


////////// DOWNLOAD & CONVERT SAMPLE //////////

var easyimage = require('easyimage'),
    request = require('request'),
    fs = require('fs'),
    util = require('util');

request({uri: 'http://24.media.tumblr.com/tumblr_m3qzl4kDe41r6f6iuo1_1280.jpg', encoding: 'binary'}, function(error, response, body){
  if(error){
    console.log(error);
  } else {
    fs.writeFile('image.jpg', body, "binary", function(err){
      if(err){
        console.log(err);
      } else {
        console.log('image saved to disk');
      }
    });
  }
});