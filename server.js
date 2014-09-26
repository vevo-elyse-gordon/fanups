var express = require('express');
var multer = require('multer');
var errorHandler = require('errorhandler');
var redis = require("redis"),
	client = redis.createClient();
var _ = require("underscore");
var moment = require('moment');
var app = express();

client.on("error", function (err) {
	console.error("Redis error", err);
});

app.use(express.static(__dirname));
app.use("/upload", [ 
	function(req, res, next) {
		console.log("POST uploading...");
		next();
	}, 
	multer({
			dest:'./uploads/'
		}) 
]);
app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}));

app.get('/', function (req, res) {
    res.redirect('/src/index.html');
});

var isrc = "7574252720", userId = "1986";
var fanupUserKey = function(isrc, userId) { return "fanups:" + isrc + ":" + userId; }

app.post('/upload', function(req, res) {
	if (req.files && !_.isEmpty(req.files) && req.files.fanup) {
		var duration = moment(req.body.startTime, "mm:ss"),
			minutes = duration.minutes(),
			seconds = duration.seconds(),
			startTimeInSeconds = minutes * 60 + seconds;
		var video = {
			"startTime": startTimeInSeconds,
			"path": "../" + req.files.fanup.path // relative to where it will be served (aka within ./src/)
		}
		var keyValuePairs = _.flatten(_.pairs(video));
		console.log("keyValuePairs", keyValuePairs); // DEBUG
		client.hmset([ fanupUserKey(isrc, userId) ].concat(keyValuePairs), function (err, replies) {
			if (err || !replies) {
				console.log("fanupError", err);
				res.send(404, "No acorns here squirrel");
			} else {
				console.log("fanupSuccess", replies); // DEBUG
				res.redirect("/");
			}
		});
	}
});

app.get('/fanups', function(req,res){
	client.hgetall(fanupUserKey(isrc, userId), function(err, data) {
		if (err !== null || data === null) {
			console.error("GET /fanups err", err);
			res.json(404, { "fanupError": err });
		} else {
			console.log("GET /fanups", data); // DEBUG
			res.json({
				"fanups": [ data ]
			});
		}
	});
});

app.listen(3000); //, '192.168.0.187'