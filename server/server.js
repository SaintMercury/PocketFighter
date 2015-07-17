//Modules to add to the server file. WARNING: Do not add these to the top of every file. Requirements need to only be here.

//Probably should not touch this. Was a pain to set up.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//Serves the index.html and allows for the necessary client serving.
app.use(express.static(__dirname + '/../build'));
app.get(__dirname+'../build', function (req, res) {
	res.sendFile(__dirname + '/build/index.html');
});

//I can touch this
io.on('connection', function(socket) {
	//Add event handlers and emitters here. This is where it get cray
	//Thes socket parameter is the specific connection.
	//io is the whole server
	console.log(socket.id);
	socket.broadcast.emit('connected', {socketid: socket.id});
	socket.on('serverUpdate', function(data) {
		socket.broadcast.emit('clientUpdate', data);
	});
	socket.on('disconnect', function() {
		socket.broadcast.emit('userDisconnect', {socketid: socket.id});
	})
});

http.listen(1337, function() {
	console.log('Running...');
});