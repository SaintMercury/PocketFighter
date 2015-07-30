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
function Room(startingPlayer) {
	this.id = startingPlayer;
	this.players = [];
	this.open = true;
}
var maxPlayers = 4;

//Changeable
io.on('connection', function(socket) {
	console.log(socket.id);
	socket.emit('obtainID', socket.id);

	socket.on('ReadyForBrokerage', function() {
		console.log('Going to assign a room');
		if(openRooms.length > 0) {
			var room = openRooms[0];
			socket.emit('RoomJoin', room.players);
			socket.room = room.id;
			room.players.push(socket.id);
			if(room.players.length >= maxPlayers) {
				openRooms.splice(0,1);
				room.open = false;
			}
		} else {
			var room = new Room(socket.id);
			socket.emit('RoomJoin');
			socket.room = room.id;
			room.players.push(socket.id);
			openRooms.push(room);
			Rooms[socket.room] = room;
		}
	});

	socket.on('disconnect', function() {
		console.log('Someone is leaving');
		console.log(socket.room);
		var room = Rooms[socket.room];
		if(room !== undefined) {
			for(var i = 0; i < room.players.length; i++) {
				if(room.players[i] === socket.id) {
					console.log('Pulled out player');
					room.players.splice(i,1);
					if(room.players.length === 0) {
						console.log('Deleted room');
						console.log(Rooms);
						delete Rooms[socket.room];
						console.log(Rooms);
						if(room.open === true) {
							for(var i = 0; i < openRooms.length; i++) {
								if(openRooms[i].id === room.id) {
									openRooms.splice(i,1);
									break;
								}
							}
						}
					} else 
					if(room.players.length === (maxPlayers - 1)){
						console.log('Room liberated')
						openRooms.push(Rooms[socket.room]);
						Rooms[socket.room].open = true;
					}
					break;
				}
			}
		}
	});
});
//End Changeable

http.on('connection', function() {
});

http.listen(1337, function() {
	console.log('Booted up Succesfully');
});