var express = require('express'),
	superfeedr = require('superfeedr').Superfeedr;

var app = express.createServer(express.logger());

app.get('/', function(req, res) {

  if(req.headers && req.headers['user-agent'] && req.headers['user-agent'] === 'Pingdom.com_bot_version_1.4_(http://www.pingdom.com)'){
    console.log('request from pingdom');
  }

  res.send('Hello World from eatingstats!');
});

app.get('/pubsub', function(request, response) {

  response.send(request.query['hub.challenge']);
  console.log('got a message from the hub');
});

app.post('/pubsub', function(request, response){
  response.send('thanks');
  console.log('someone POSTed to /pubsub');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});


////////// SUBSCRIBE TO THE REMOTE HUB //////////

var client = new superfeedr(process.env.SUPERFEEDR_LOGIN, process.env.SUPERFEEDR_PASSWORD);

// Fire when connected to superfeedr
client.on('connected', function(){
	console.log('Connected to Superfeedr!');

	// Subscribe to feeds
	client.subscribe("http://everrouter.tumblr.com/rss", function(err, feed){
		console.log('Subscribed to everrouter Feed!');
	});

  client.subscribe("http://eatingstats.tumblr.com/rss", function(err, feed){
    console.log('Subscribed to eatingstats Feed!');
  });

  client.subscribe("http://philippkueng.tumblr.com/rss", function(err, feed){
    console.log('Subscribed to philippkueng Feed!');
  });

});

client.on('notification', function(notification){
  console.log('processing the notification...');
  console.log('-------- NOTIFICATION --------');
	console.log(notification);
});

