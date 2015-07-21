'use-strict';

var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '', {preload: preload, create: create, update: update});

//Needed globals for game
var players;
var self;
var others;
var keys;
var myId;
var hostBool;

//Initialize
function preload() {
	others = {};
	//pre setup - Load up assets, set event recievers, stuff like that nature
	game.load.image('pixel','/Assets/Textures/pixel.png');
	recieverSetup();
}

function create() {
	//Create step - Create objects using loaded assets, set placement, stuff that's not 'really' active at runtime
	players = game.add.group();
	self = players.create(game.world.randomX, game.world.randomY, 'pixel');
	self.scale.setTo(20,20);
	self.anchor.setTo(0.5,0.5); //I think this centers the object's reference
	self.tint = 0xff0000;

	socket.emit('fetchGameData', {id: myId, x: self.x, y: self.y});

	keys = game.input.keyboard.createCursorKeys();
}

function update() {
	if(hostBool !== undefined && myId !== undefined) {
		controls(self,keys);
		if(hostBool === false) {
			var data = {};
			data.id = myId;
			data.x = self.x;
			data.y = self.y;
			socket.emit('clientSend', data);
		} else {
			socket.emit('hostSend', sendHostInstance());
		}
	}
}

function recieverSetup() {
	socket.on('sendID', function(data) {
		myId = data;
		socket.on('hostAssign', function(data) {
			hostBool = true;
			console.log(hostBool);
			socket.on('hostRecieve', function(data) {
				var player = others[data.id];
				console.log(player);
				player.x = data.x;
				player.y = data.y;
			});
			socket.on('fetchGameData', function(data) {
				//When a player requests the current instance on joining, make them in the world.
				others[data.id] = players.create(data.x, data.y, 'pixel');
				others[data.id].scale.setTo(20,20);
				others[data.id].anchor.setTo(0.5,0.5);
				others[data.id].tint = 0x0000ff;
				socket.emit('recieveGameData', sendHostInstance());
			});
		});

		socket.on('clientAssign', function(data) {
			hostBool = false;
			console.log(hostBool);
			socket.on('clientRecieve', function(data) {
				recieveHostInstance();
			});
			socket.on('recieveGameData', function(data) {
				for(var i in data) {
					console.log(data[i].id);
					console.log(myId);
					if(data[i].id != myId) {
						var currentPlayer = data[i];
						others[currentPlayer.id] = players.create(currentPlayer.x, currentPlayer.y, 'pixel');
						others[currentPlayer.id].scale.setTo(20,20);
						others[currentPlayer.id].anchor.setTo(0.5,0.5);
						others[currentPlayer.id].tint = 0x0000ff;
					}
				}
			});
		});
	});
}

function sendHostInstance() {
	var data = {};
	for(var i in others) {
		var currentPlayer = others[i];
		data[currentPlayer.id] = {};
		data[currentPlayer.id].id = currentPlayer.id;
		data[currentPlayer.id].x = currentPlayer.x;
		data[currentPlayer.id].y = currentPlayer.y;
	}
	data[myId] = {};
	data[myId].id = myId;
	data[myId].x = self.x;
	data[myId].y = self.y;
	return data;
}

function recieveHostInstance(data) {
	for(var i in data) {
		var currentPlayer = data[i];
		if(currentPlayer.id != myId) {
			others[currentPlayer.id].x = currentPlayer.x;
			others[currentPlayer.id].y = currentPlayer.y;
		}
	}
}

module.exports = game;