'use-strict';

var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

//Needed globals for game
var players;
var self;
var others;
var keys;
var myId;
var roomId;
var hostBool;
var gameData;

var synchState = {
	create: function() {
		socket.on('sendID', function(data) {
			myId = data;
			socket.emit('IDConfirm', myId);
			socket.on('JoinError', function(data) {
				console.log(data);
			});
			socket.on('hostAssign', function(data) {
				roomId = data;
				hostBool = true;
				game.state.start('game');
			});
			socket.on('clientAssign', function(data) {
				roomId = data;
				hostBool = false;
				socket.on('recieveGameData', function(data) {
					gameData = data;
					game.state.start('game');
				});
				socket.emit('fetchGameData',{id: myId, room: roomId});
			});
		});
	}
}
game.state.add('synch', synchState, true);

var gameState = {
	preload: function() {
		others = {};
		game.load.image('pixel','/Assets/Textures/pixel.png');
	},
	create: function() {
		players = game.add.group();
		self = players.create(game.world.randomX, game.world.randomY, 'pixel');
		self.scale.setTo(20,20);
		self.anchor.setTo(0.5,0.5); //I think this centers the object's reference
		self.tint = 0xff0000;
		keys = game.input.keyboard.createCursorKeys();

		if(hostBool === true) {
			socket.on('fetchGameData', function(data) {
				socket.emit('recieveGameData', sendHostInstance());
				others[data.id] = players.create(-10,-10,'pixel');
				others[data.id].scale.setTo(20,20);
				others[data.id].anchor.setTo(0.5,0.5);
				others[data.id].tint = 0x0000ff;
			});
			socket.on('hostRecieve', function(data) {
				others[data.id].x = data.x;
				others[data.id].y = data.y;
			});
		} else {
			for(var i in gameData) {
				var guy = gameData[i];
				others[guy.id] = players.create(guy.x, guy.y, 'pixel');
				others[guy.id].scale.setTo(20,20);
				others[guy.id].anchor.setTo(0.5,0.5);
				others[guy.id].tint = 0x0000ff;
			}
			socket.on('clientRecieve', function(data) {
				recieveHostInstance(data);
			});
			socket.on('newPlayer', function(data) {
				if(data.id !== myId) {
					others[data] = players.create(-10,-10,'pixel');
					others[data].scale.setTo(20,20);
					others[data].anchor.setTo(0.5,0.5);
					others[data].tint = 0x0000ff;
				}
			});
		}
	},
	update: function() {
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
}
game.state.add('game', gameState, false);

function sendHostInstance() {
	var data = {};
	for(var i in others) {
		data[i] = {};
		data[i].id = i;
		data[i].x = others[i].x;
		data[i].y = others[i].y;
	}
	data[myId] = {};
	data[myId].id = myId;
	data[myId].x = self.x;
	data[myId].y = self.y;
	return data;
}

function recieveHostInstance(data) {
	for(var i in data) {
		if(data[i].id != myId) {
			others[data[i].id].x = data[i].x;
			others[data[i].id].y = data[i].y;
		}
	}
}

game.state.start('synch');

module.exports = game;