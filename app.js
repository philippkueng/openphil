var express = require('express'),
    config = require('./config');

var app = express.createServer(express.logger());

app.get('/', function(req, res) {

  if(req.headers && req.headers['user-agent'] && req.headers['user-agent'] === 'Pingdom.com_bot_version_1.4_(http://www.pingdom.com)'){
    console.log('request from pingdom');
  }

  res.send('Hello World from eatingstats!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
