var express = require('express'),
	superfeedr = require('superfeedr').Superfeedr;

var app = express.createServer(express.logger());

// app.configure(function(){
//     app.use(express.methodOverride());
//     app.use(express.bodyParser());
//     app.use(app.router);
// });

app.get('/', function(request, response) {
  response.send('Hello World from eatingstats!');
});

app.get('/pubsub', function(request, response) {

  response.send(request.query['hub.challenge']);
  console.log('got a message from the hub');
});

app.post('/pubsub', function(request, response){
  response.send('thanks');

  console.log(request);
  console.log('-------BODY--------');
  console.log(request.body);
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

});

client.on('notification', function(notification){
  console.log('processing the notification...');
  console.log('-------- NOTIFICATION --------');
	console.log(notification);
});

// subscribe to the remote hub

// var nubnub = require('nubnub');
// var cli = nubnub.client({
// 	hub: "http://tumblr.superfeedr.com",
// 	topic: "http://everrouter.tumblr.com/rss",
// 	callback: "http://eatingstats.herokuapp.com/pubsub"
// });

// console.log("subscribing....");
// cli.subscribe(function(err, resp, body){
// 	if(err){
// 		console.log(err);
// 	} else {
// 		console.log(resp.statusCode + ': ' + body);
// 	}
// });

