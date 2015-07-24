var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var peerServer = require('peer').ExpressPeerServer(http);

app.use(express.static(__dirname + '/../build'), peerServer);
app.get(__dirname+'../build', function (req, res) {
	res.sendFile(__dirname + '/build/index.html');
});

var Rooms = {};
var openRooms = [];
function Room(host) {
	this.id = host;
	this.clients = [];
}
var maxPlayers = 3;

io.on('connection', function(socket) {
	//Sets up 2 player rooms atm
	console.log(socket.id);
	socket.emit('obtainID', socket.id);

	socket.on('ReadyForBrokerage', function() {
		console.log('User successfully connected');
		if(openRooms.length == 0) {
			console.log('Host made and awaiting');
			//Create a new room, say has open slots, and register it in the room list
			var newRoom = new Room(socket.id);
			openRooms.push(newRoom);
			Rooms[socket.id] = newRoom;
			socket.emit('Host');
			//Tag the socket
			socket.host = true;
		} else {
			var host = openRooms[0];
			if(host.clients.length < maxPlayers) {
				console.log('Client made and forwarding to host');
				socket.emit('Client', host.id);
				host.clients.push(socket.id);
				if(host.clients.length >= maxPlayers) {
					console.log('Room closed');
					openRooms.shift();
				}
			} else {
				openRooms.shift();
				console.log('Making new Room');
				var newRoom = new Room(socket.id);
				openRooms.push(newRoom);
				Rooms[socket.id] = newRoom;
				socket.emit('Host');
				socket.host = true;
			}
		}
	});

	socket.on('PlayerLeft', function(data) {
		var flag = false;
		for(var i = 0; i < openRooms.length; i++) {
			if(openRooms[i].id === socket.id) {
				flag = true;
				break;
			}
		}
		if(flag === false) {
			openRooms.push(Rooms[socket.id]);
		}
		delete Rooms[socket.id].clients[data];
	});

	socket.on('disconnect', function() {
		console.log('User disconnected');
		if(socket.host === true) {
			if(Rooms[socket.id].clients.length > 0) {
				var room = Rooms[socket.id];
				//Check if room is open
				var flag = false;
				for(var i in openRooms) {
					if(openRooms[i].id === socket.id) {
						flag = true;
						break;
					}
				}
				if(flag === false) {
					openRooms.push(Rooms[socket.id]);
				}
			} else {
				//Get the room outta hya
				delete Rooms[socket.id];
				for(var i in openRooms) {
					if(openRooms[i].id === socket.id) {
						openRooms.splice(i,1);
						break;
					}
				}
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