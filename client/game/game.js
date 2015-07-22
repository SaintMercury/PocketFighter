'use-strict';

var controls = require('./controls/controls.js');
var p2p = require('./peer.js');

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

p2p.on('open', function (id) {
	console.log(id);
});

var synchState = {
	create: function() {
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
	},
	update: function() {
		if(hostBool !== undefined && myId !== undefined) {
			controls(self,keys);
			if(hostBool === false) {
				var data = {};
				data.id = myId;
				data.x = self.x;
				data.y = self.y;
			} else {
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