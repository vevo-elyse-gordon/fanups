var express = require('express');
var multer = require('multer');
var errorHandler = require('errorhandler');

var app = express();

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

app.post('/', function(req, res) {
	res.redirect('/src/index.html');
});

app.get('/fanups', function(req,res){
	res.send([
		{
			path: "../uploads/8865414b2f644d14ee4e692607ed79d3.mp4",
			startTime: 5
		}
	]);
});

app.listen(3000); //, '192.168.0.187'