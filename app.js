var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World from eatingstats!');
});

app.get('/pubsub', function(request, response) {
  response.send('pubsub route');
  console.log('got a message from the hub');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

// subscribe to the remote hub

var nubnub = require('nubnub');
var cli = nubnub.client({
	hub: "http://tumblr.superfeedr.com",
	topic: "http://everrouter.tumblr.com/rss",
	callback: "http://eatingstats.herokuapp.com/pubsub"
});

console.log("subscribing....");
cli.subscribe(function(err, resp, body){
	if(err){
		console.log(err);
	} else {
		console.log(resp.statusCode + ': ' + body);
	}
});

