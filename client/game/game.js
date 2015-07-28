'use-strict';
var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

var peer;
var hostBool;
var ID;
var otherPlayersAvatars;
var self;
var otherPlayersData = []; //Connection to other clients
var host; //Connection to host

var syncState = {
	preload: function() {
		console.log('SYNC');
		socket.on('obtainID', function(data) {
			peer = new Peer(data,{host: '/', port: 1337});
			ID = data;
			console.log('ID obtained: ' + ID);
			socket.emit('ReadyForBrokerage');
		});

		socket.on('ClientAssign', function(data) {
			console.log('CLIENT');
			hostBool = false;
			host = peer.connect(data, {metadata: ID});
			game.state.start('game');
		});

		socket.on('HostAssign', function() {
			console.log('HOST');
			hostBool = true;
			game.state.start('game');
		});
	}
};

var gameState = {
	preload: function() {
		console.log('GAME');
		game.load.image('pixel', 'Assets/Textures/pixel.png');
	},
	create: function() {
		//
		if(hostBool === false) {
			//Setup P2P connections - client
			socket.on('HostPromotion', function() {
				host.close();
				delete host;
				socket.emit('PromotionAccepted');
			});

			socket.on('NewHost', function(data) {
				host.close();
				delete host;
				host = peer.connect(data, {metadata:ID});
				//Setup P2P connections - client
			});
		}
		//Every client will be able to become a host immediatly upon a disconnect. More loading initially,less later hopefully.
		peer.on('connection', function(conn) {
			//Setup P2P connections - host
			conn.on('close', function() {
				socket.emit('PlayerLeave', conn.metadata);
			});
		});
	},
	update: function() {
		//
	}
};

function dataPlexor(data) {
	switch(data.type) {
		//
	}
}

game.state.add('sync', syncState, true);
game.state.add('game', gameState, false);
module.exports = game;