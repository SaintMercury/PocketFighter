//Modules to add to the server file. WARNING: Do not add these to the top of every file. Requirements need to only be here.

//Probably should not touch this. Was a pain to set up.
var express = require('express');
var peer = require('peer');
var app = express();
var http = require('http').Server(app);
var peerServer = peer.ExpressPeerServer;

app.use(express.static(__dirname + '/../build'), peerServer(http));
app.get(__dirname+'../build', function (req, res) {
	res.sendFile(__dirname + '/build/index.html');
});

http.listen(9000, function() {
	console.log('Running');
});

var rooms = [];
var maxPlayers = 4;

function Room() {
	this.currentPlayers = [];
}
http.on('connection', function(peer) {
	//Begin the crazies
	joinHandler(peer);
});

function joinHandler(peer) {
	if(rooms.length === 0) {
		var room = new Room();
		room.currentPlayers.push(peer);
		rooms.push(room);
		peer.host = true;
		return;
	}
	for(var i = 0; i < rooms.length; i++) {
		if(rooms[i].currentPlayers.length < maxPlayers) {
			peer.host = false;
			rooms[i].currentPlayers.push(peer);
			return;
		}
	}
	var room = new Room();
	room.currentPlayers.push(peer);
	rooms.push(room);
	peer.host = true;
	return;
}