var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: process.argv[2],
    consumer_secret: process.argv[3],
    access_token_key: process.argv[4],
    access_token_secret: process.argv[5]
});
var analyze = require('Sentimental').analyze,
    positivity = require('Sentimental').positivity,
    negativity = require('Sentimental').negativity;
var http = require('http');
var fs = require('fs');

function PostTweet(name,columns,point) {
  // Build the post string from an object
  var job = JSON.stringify({
       "type": "irc",
       "title": message.channel,
       "data": {
          "title": message.channel,
          "name": name,
          "columns": columns,
          "point": point
        },
        "options" : {
          "title": message.channel,
          "attempts": 5,
          "priority": "normal"
       }
     });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '5050',
      path: "/job",
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': job.length
      }
  };
  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  // post the data
  post_req.write(job);
  post_req.end();
}

twit.stream('statuses/filter', {track:'bitcoin,btc,bitcoin wallet,coinbase,Satoshi,51% Attack,btce,campbx,bitstamp'}, function(stream) {
  stream.on('data', function(data) {
    var text = data.text.replace(/[^a-zA-Z ]/g, "");
    var name = "tweets";
    var columns = ["time", "user_id", "user_name", "tweet_id", "text", "sentiment", "positivity", "negativity"]
    var point = [
      data.timestamp_ms,
      data.user.id,
      data.user.screen_name,
      data.id,
      text,
      analyze(text).score,
      positivity(text).score,
      negativity(text).score
    ];
    PostTweet(name,columns,point);
        console.log(name);
        console.log(columns);
        console.log(point)
    });
});
