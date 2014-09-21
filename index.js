var irc = require('irc');
var analyze = require('Sentimental').analyze,
    positivity = require('Sentimental').positivity,
    negativity = require('Sentimental').negativity;
var http = require('http');
var fs = require('fs');

function PostIrc(message) {
  // Build the post string from an object
  var influxPost = JSON.stringify([
	{
	"name" : "irc",
	"columns" : ["channel", "user", "message", "sentiment", "positivity", "negativity"],
	"points" : [
		[
			message.channel,
			message.user,
			message.text.replace('([^a-zA-Z 0-9+-.,!@#$%^&*();\\\/|<>"\':?=])+', ''),
			analyze(message.text).score,
			positivity(message.text).score,
			negativity(message.text).score
		]
	]
	}
  ]);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '8086',
      path: "/db/bitcoin/series?u=root&p=root",
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': influxPost.length
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
  post_req.write(influxPost);
  post_req.end();
}

var client = new irc.Client('irc.freenode.net', 'olil3olli3', {
    channels: ['#bitcoin']
});

var join = [
	'#bitcoin-court',
	'#bitcoin-dev',
	'#bitcoin-gaming',
	'#bitcoin-gentoo',
	'#bitcoin-marketing',
	'#bitcoin-news',
	'#bitcoin-police',
	'#bitcoin-politics',
	'#bitcoin-pricetalk',
	'#bitcoin-tweets',
	'#bitcoin-wiki',
	'#bitcoin-assets',
	'#bitcoin-auction',
	'#bitcoin-otc',
	'#coinbase',
	'#bitcoin-stackexchange',
	'#avalon',
	'#bitcoin-mining',
	'#eligius',
	'#btcguild',
	'#butterflylabs',
	'#give-me-coins',
	'#mining.bitcoin.cz',
	'#ozcoin',
	'#xkcd-bitcoin',
	'#p2pool',
	'#bitcoin-eastcoastusa'
];

client.addListener('message', function (from, to, message) {
	var ircMessage = {
		'channel': to,
		'user': from,
		'text': message
	};
	PostIrc(ircMessage);
    console.log(to + ' => ' + from + ': ' + message);
    console.log(analyze(message).score);
    console.log(positivity(message).score);
	console.log(negativity(message).score);
});

client.addListener('error', function(message) {
	console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

(function() {
    // Define a variable
    var i = 0,
        action = function() {
            // Condition to run again
            if (i < join.length) {
                client.join(join[i]);

                // Add one to i
                i++;
                setTimeout(action, 3000);
            }
        };

    setTimeout(action, 3000);
})();