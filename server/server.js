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
var maxPlayers = 4;

io.on('connection', function(socket) {
	//Sets up 2 player rooms atm
	console.log(socket.id);
	socket.emit('obtainID', socket.id);

	socket.on('ReadyForBrokerage', function() {
		console.log('User successfully connected');
		if(waitingHosts.length === 0) {
			console.log('Host made and awaiting');
			waitingHosts.push(socket);
			socket.currentPlayers = 1;
			socket.emit('Host');
		} else {
			console.log('Client made and forwarding to host');
			var host = waitingHosts[0];
			if(host.currentPlayers < maxPlayers) {
				socket.emit('Client', host.id);
				host.currentPlayers++;
				if(host.currentPlayers >= maxPlayers) {
					console.log('Room closed');
					waitingHosts.shift();
				}
			}
		}
	});

	socket.on('PlayerLeft', function() {
		waitingHosts.push(socket);
		socket.currentPlayers--;
		console.log(socket.currentPlayers);
	});

	socket.on('disconnect', function() {
		console.log('User disconnected');
		for(var i in waitingHosts) {
			if(waitingHosts[i].id === socket.id) {
				console.log('Host room removed');
				waitingHosts.splice(i, 1);
				return;
			}
		}
	});
});

http.on('connection', function() {
	console.log('Connection recieved');
});

http.on('disconnect', function() {
	console.log('disconnect');
});

http.listen(1337, function() {
	console.log('Booted up Succesfully');
});