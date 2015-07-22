var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

var ID;
var peer;
var connectee;
var hostBool = true;
var players;
var self;
var otherPlayer;
var keys;

var syncState = {
	preload: function() {
		console.log('SYNC');
		socket.on('obtainID', function(data) {
			console.log('ID obtained');
			ID = data;
			peer = new Peer(data, {host: 'localhost', port: 1337});
			peer.on('open', function(conn) {
				console.log('Ready for match making');
				socket.emit('ReadyForBrokerage');
			});
		});

		//Host
		socket.on('Host', function() {
			console.log('I am host');
			game.state.start('game');
		});

		//Client
		socket.on('Client', function(data) {
			console.log('I am client');
			hostBool = false;
			connectee = peer.connect(data);
			connectee.on('open', function() {
				console.log('Connected to host');
				game.state.start('game');
			});
		});
	}
};

var gameState = {
	preload: function() {
		console.log('GAME');
		game.load.image('pixel', '/Assets/Textures/pixel.png');
	},
	create: function() {
		players = game.add.group();
		self = players.create(game.world.randomX, game.world.randomY, 'pixel');
		self.scale.setTo(20,20);
		self.anchor.setTo(0.5,0.5);
		self.tint = 0xff0000;
		keys = game.input.keyboard.createCursorKeys();
		if(hostBool === true) {
			console.log('Assigning connection reciever');
			peer.on('connection', function(conn) {
				console.log('Peer connected to me');
				connectee = conn;
				connectee.on('data', updateHandler);
			});
		} else {
			connectee.send({type:'NewJoin',x:self.x,y:self.y})
			connectee.on('data', updateHandler);
		}
	},
	update: function() {
		if(!!otherPlayer != undefined && !!connectee != undefined) {
			connectee.send({type:'Update',x:self.x,y:self.y});
		}
		controls(self,keys);
	}
};

function updateHandler(data) {
	switch(data.type) {
		case 'NewJoin':
			otherPlayer = players.create(data.x, data.y, 'pixel');
			otherPlayer.scale.setTo(20,20);
			otherPlayer.anchor.setTo(0.5,0.5);
			otherPlayer.tint = 0x00ff00;
			if(hostBool === true) {
				connectee.send({type:'NewJoin',x:self.x,y:self.y});
			}
			break;
		case 'Update':
			otherPlayer.x = data.x;
			otherPlayer.y = data.y;
			break;
	}
}

game.state.add('sync', syncState, true);
game.state.add('game', gameState, false);

module.exports = game;