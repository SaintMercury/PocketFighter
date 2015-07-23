'use-strict';
var socket = require('./socket.js');
var controls = require('./controls/controls.js');
var updateHandler = require('./updateHandler.js');
var newJoinHendler = require('./newJoinHandler.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

var ID;
var peer;
var connections = {}; //For the host
var host; //For clients
var hostBool = true;
var players;
var self;
var otherPlayers = {};
var keys; //Controls

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
			host = peer.connect(data, {metadata: ID});
			host.on('open', function() {
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
		//Base game stuff
		players = game.add.group();
		self = players.create(game.world.randomX, game.world.randomY, 'pixel');
		self.scale.setTo(20,20);
		self.anchor.setTo(0.5,0.5);
		self.tint = 0xff0000;
		keys = game.input.keyboard.createCursorKeys();

		//Online
		if(hostBool === true) {
			console.log('Assigning connection reciever');
			peer.on('connection', function(conn) {
				console.log('Peer connected to me');

				conn.on('data', function(data) {
					eventMultiplexor(data, conn);
				});

				conn.on('close', function() {
					otherPlayers[conn.metadata].destroy();
					delete otherPlayers[conn.metadata];
					delete connections[conn.metadata];
					console.log(connections);
					for(var i in connections) {
						console.log('Leave event sent');
						connections[i].send({type: 'PlayerLeave', id: conn.metadata});
					}
					console.log('0-2 leave events');
					socket.emit('PlayerLeft');
				});

				console.log(conn.metadata);
				connections[conn.metadata] = conn;
			});
		} else {
			host.send({type:'NewJoin',id:ID,x:self.x,y:self.y});
			host.on('data', function(data) {
				eventMultiplexor(data, host);
			});
			host.on('close', function() {
				console.log('Lost connection to host');
				location.reload(); //Reload page
			});
		}
	},
	update: function() {
		if(hostBool === true) {
			var dataPackage = getInstance();
			for(var i in connections) {
				connections[i].send(dataPackage);
			}
		} else {
			host.send({type: 'Update', id: ID, x: self.x, y: self.y});
		}
		controls(self,keys);
	}
};

function eventMultiplexor(data, conn) {
	switch(data.type) {
		case 'NewJoin':
			newJoinHendler(data, otherPlayers, players, 'pixel', connections, hostBool, ID);
			if(hostBool === true) {
				var data = getInstance();
				data.type = 'GetInstance';
				conn.send(data);
				console.log(connections);
			}
			console.log(otherPlayers);
			break;
		case 'Update':
			updateHandler(data, otherPlayers, hostBool);
			break;
		case 'GetInstance':
			console.log('Got the game data');
			for(var i in data) {
				if(i !== 'type') {
					if(data[i].id !== ID) {
						otherPlayers[i] = players.create(data[i].x, data[i].y, 'pixel');
						var newGuy = otherPlayers[i];
						newGuy.scale.setTo(20,20);
						newGuy.anchor.setTo(0.5,0.5);
						newGuy.tint = 0x00ff00;
					}
				}
			}
			break;
		case 'PlayerLeave':
			console.log('Player left the game');
			console.log(data.id);
			otherPlayers[data.id].destroy();
			delete otherPlayers[data.id];
			break;
	}
}

function getInstance() {
	var dataPackage = {};
	for(var i in otherPlayers) {
		dataPackage[i] = {id: i, x: otherPlayers[i].x, y: otherPlayers[i].y};
	}
	dataPackage[ID] = {id: ID, x: self.x, y: self.y};
	dataPackage.type = 'Update';
	return dataPackage;
}

game.state.add('sync', syncState, true);
game.state.add('game', gameState, false);

module.exports = game;