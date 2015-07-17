var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '', {preload: preload, create: create, update: update});

//Needed globals for game


//Initialize
function preload() {
	//Assign event recievers here.
	socket.on('connected', function(data) {
		console.log(data.data);
	});
	socket.on('clientUpdate', function(data) {
		clientUpdate(data);
	});
};
function create() {};
function update() {
	serverUpdate();
};

function clientUpdate(data) {
	var others = data.players;
}

function serverUpdate() {
	var data = {socketid: socket.id};
	//data['position'] = {x:,y:};
	socket.emit('serverUpdate', data);
}

module.exports = game;