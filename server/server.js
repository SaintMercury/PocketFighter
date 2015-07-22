var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var peerServer = require('peer').ExpressPeerServer(http);

app.use(express.static(__dirname + '/../build'), peerServer);
app.get(__dirname+'../build', function (req, res) {
	res.sendFile(__dirname + '/build/index.html');
});

var waitingHosts = [];

io.on('connection', function(socket) {
	console.log(socket.id);
	socket.emit('obtainID', socket.id);
	socket.on('ReadyForBrokerage', function() {
		if(waitingHosts.length === 0) {
			waitingHosts.push(socket);
		} else {
			waitingHosts.shift().emit('Client', socket.id);
		}
	});
});

http.on('connection', function(id) {
	//do something?
	console.log('peer connected');
});

http.listen(1337, function() {
	console.log('Running...');
});