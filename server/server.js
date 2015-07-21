//Modules to add to the server file. WARNING: Do not add these to the top of every file. Requirements need to only be here.

//Probably should not touch this. Was a pain to set up.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
	pingTimeout: 10000,
	pingInterval: 500
});

//Serves the index.html and allows for the necessary client serving.
app.use(express.static(__dirname + '/../build'));
app.get(__dirname+'../build', function (req, res) {
	res.sendFile(__dirname + '/build/index.html');
});

var rooms = [];
function Room(id) {
	this.id = id;
	this.currentPlayers = [];
	this.maxPlayers = 4;
}

io.on('connection', function(socket) {
	var myID = guid();
	var roomID;
	socket.emit('sendID', myID);
	socket.on('IDConfirm', function(data) {
		if(data === myID) {
			roomID = joinHandler(socket, myID);
		} else {
			socket.emit('JoinError', 'ID confirmation failed');
		}
	});

	//Game data event forwarder
	socket.on('fetchGameData', function(data) {
		socket.to(roomID).emit('newPlayer', data.id);
		socket.to(roomID).emit('fetchGameData', data);
	});
	socket.on('recieveGameData', function(data) {
		socket.to(roomID).emit('recieveGameData', data);
	});

	//Host-Client Pseudo setup/forwarding system
	socket.on('clientSend', function(data) {
		socket.to(roomID).emit('hostRecieve', data);
	});
	socket.on('hostSend', function(data) {
		socket.to(roomID).emit('clientRecieve', data);
	});
});

http.listen(1337, function() {
	console.log('Running...');
});

function joinHandler(socket, GUID) {
	if(rooms.length === 0) {
		var newRoom = new Room(Date.now());
		rooms.push(newRoom);
		newRoom.currentPlayers.push('h'+GUID);
		socket.emit('hostAssign', newRoom.id);
		socket.join(newRoom.id);
		return newRoom.id;
	} else {
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].currentPlayers.length < rooms[i].maxPlayers) {
				rooms[i].currentPlayers.push(GUID);
				socket.emit('clientAssign', rooms[i].id);
				socket.join(rooms[i].id);
				return rooms[i].id;
			}
		}
	}
	var newRoom = new Room(Date.now());
	rooms.push(newRoom);
	newRoom.currentPlayers.push('h'+GUID);
	socket.emit('hostAssign', newRoom.id);
	socket.join(newRoom.id);
	return newRoom.id;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}