//Modules to add to the server file. WARNING: Do not add these to the top of every file. Requirements need to only be here.

//Probably should not touch this. Was a pain to set up.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Serves the index.html and allows for the necessary client serving.
app.use('/', express.static(__dirname + '/'));
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

//I can touch this
io.on('connection', function(socket) {
	//Add event handlers and emitters here. This is where it get cray
	//Thes socket parameter is the specific connection.
	//io is the whole server
	console.log('Someone is here');
	socket.emit('connected', {data: "So proud of you"});
	socket.on('gameLoad', function(obj) {
		console.log(obj.data);
	});
	socket.on('update', function(obj) {
		console.log(obj);
	});
});

http.listen(1337, function() {
	console.log('Running...');
});