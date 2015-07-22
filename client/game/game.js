var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

var ID;
var peer;
var conn;

socket.on('obtainID', function(data) {
	ID = data;
	peer = new Peer(data, {host: 'localhost', port: 1337});
	peer.on('open', function(id) {
		socket.emit('ReadyForBrokerage', ID);
	});

	//Host
	peer.on('connection', function(conn) {
		conn.on('open', function() {
			conn.on('data', function(data) {
				console.log('Recieved Data: ' + data);
			});
		});
	});
});

//Client
socket.on('Client', function(data) {
	conn = peer.connect(data);
	conn.on('open', function() {
		conn.send('I am client!');
	});
});

module.exports = game;