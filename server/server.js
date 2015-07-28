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
function Room(hostID) {
	this.host = hostID;
	this.players = [];
	this.open = true;
}
var maxPlayers = 3;

//Changeable
io.on('connection', function(socket) {
	//Sets up 2 player rooms atm
	console.log(socket.id);
	socket.emit('obtainID', socket.id);
	socket.on('ReadyForBrokerage', function() {
		if(openRooms.length > 0) {
			var room = openRooms[0];
			room.players.push(socket.id);
			socket.emit('ClientAssign', room.host);
			if(room.players.length >= maxPlayers) {
				openRooms.splice(0,1);
				room.open = false;
			}
		} else {
			var room = new Room(socket.id);
			socket.emit('HostAssign');
			openRooms.push(room);
			Rooms[socket.id] = room;
			socket.host = true;
		}
	});

	//Host telling the server someone left.
	socket.on('PlayerLeave', function(data) {
		console.log('Someone left');
		for(var i = 0; i < Rooms[socket.id].players.length; i++) {
			if(Rooms[socket.id].players[i] === data) {
				Rooms[socket.id].players.splice(i,1);
				break;
			}
		}
		if(Rooms[socket.id].open === false) {
			openRooms.push(Rooms[socket.id]);
			Rooms[socket.id].open = true;
		}
	});

	socket.on('PromotionAccepted', function() {
		console.log('Promoted: ' + socket.id);
		socket.host = true;
		if(Rooms[socket.id].players.length > 0) {
			for(var i = 0; i < Rooms[socket.id].players.length; i++) {
				console.log('Telling: ' + socket.id);
				socket.to(Rooms[socket.id].players[i]).emit('NewHost', socket.id);
			}
		}
	});

	//
	socket.on('disconnect', function() {
		console.log('Someone left');
		if(socket.host === true) {
			console.log('Host left');
			var room = Rooms[socket.id];
			if(room.players.length > 0) {
				var newHost = room.players.shift();
				var newRoom = new Room(newHost);
				newRoom.players = room.players;
				openRooms.push(newRoom);
				Rooms[newHost] = newRoom;
				io.to(newHost).emit('HostPromotion');
			}
			if(room.open === true) {
				console.log('Room is open');
				for(var i = 0; i < openRooms.length; i++) {
					if(openRooms[i].host === socket.id) {
						console.log('Room removed');
						openRooms.splice(i,1);
						break;
					}
					console.log('Not this one');
				}
			}
			delete Rooms[socket.id];
		} else {
			console.log('Player left');
		}
	});
});
//End Changeable

http.on('connection', function() {
	//console.log('Connection recieved');
});

http.listen(1337, function() {
	console.log('Booted up Succesfully');
});