'use-strict';
var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

//Network shtuff
var peer;
var authority = false;
var successor = false;
var ID;
var connections = [];

//Game shtuff
var self;
var others = {};
var players;
var arrows;
var buttons;

var activeBullets;

var syncState = {
	preload: function() {
		console.log('SYNC');
		socket.on('obtainID', function(data) {
			peer = new Peer(data,{host: '/', port: 1337});
			ID = data;
			console.log('ID obtained: ' + ID);
			game.state.start('game');
		});
	}
};

var enableControls = false;
var gameState = {
	preload: function() {
		console.log('GAME');
		game.load.image('pixel', 'Assets/Textures/pixel.png');
	},
	create: function() {
		//Load up assets, set gravity, yada yada yada
		game.physics.startSystem(Phaser.Physics.ARCADE);
		players = game.add.group();
		game.physics.arcade.enable(players);
		players.enableBody = true;
		self = players.create(game.world.randomX, game.world.randomY, 'pixel');
		self.scale.setTo(20,20);
		self.anchor.setTo(0.5,0.5);
		self.tint = getRandomColor();
		self.body.collideWorldBounds = true;
		self.Dodge = Dodge;
		self.Slash = Slash;
		self.Shoot = Shoot;
		self.ammo = 6;
		self.canShoot = true;
		self.canDodge = true;
		self.canKnife = true;
		self.strafing = false;
		self.directionX = 1;
		self.directionY = 1;

		arrows = game.input.keyboard.createCursorKeys();
		buttons = game.input.keyboard.addKeys({'shoot':Phaser.Keyboard.Z,'slash':Phaser.Keyboard.X,'dodge':Phaser.Keyboard.C,'strafe':Phaser.Keyboard.SPACEBAR});

		activeBullets = game.add.group();

		socket.on('RoomJoin', function(data) {
			console.log('Joined a room');
			console.log(data);
			//Check if I'm first join
			peer.on('connection', function(conn) {
				console.log(conn.metadata);
				if(connections.length === 0) {
					conn.successor = true;
				}
				connections.push(conn);
				console.log('New guy');
				conn.on('open', function() {
					var newPlayer = players.create(-10,-10,'pixel');
					newPlayer.scale.setTo(20,20);
					newPlayer.anchor.setTo(0.5,0.5);
					newPlayer.body.collideWorldBounds = true;
					newPlayer.ammo = 6;
					newPlayer.canShoot = true;
					newPlayer.canDodge = true;
					newPlayer.canKnife = true;
					newPlayer.strafing = false;
					newPlayer.directionX = 1;
					newPlayer.directionY = 1;
					newPlayer.id = conn.metadata;
					newPlayer.Dodge = Dodge;
					newPlayer.Slash = Slash;
					newPlayer.Shoot = Shoot;
					others[conn.metadata] = newPlayer;
					console.log(others);
					console.log(connections);

					conn.on('data', function(data) {
						dataPlexor(data, conn);
					});

					conn.on('close', function() {
						others[newPlayer.id].destroy();
						for(var i = 0; i < connections.length; i++) {
							if(connections[i].metadata === conn.metadata) {
								if(connections.splice(i,1).successor === true) {
									connections[0].successor = true;
								}
								break;
							}
						}
					});
				});
			});

			if(typeof data === 'object') {
				console.log('Connecting to others');
				for(var i = 0; i < data.length; i++) {
					console.log('Connecting...');
					var conn = peer.connect(data[i], {metadata: ID});
					//console.log(conn.metadata); //This is our ID
					connections.push(conn);
					conn.on('open', function() {
						console.log('Joined');
						conn.send({
							type: 'InitialPacket',
							initialX: self.x,
							initialY: self.y,
							color: self.tint,
							id: ID
						});
						conn.on('data', function(data) {
							dataPlexor(data, conn);
						});
						conn.on('close', function() {
							//Remove from connections and others
							//Check to see if host left, and promote self to new authority
							//alert another connection for successor
						});
					});
				}
			} else {
				//Fix stuff
				authority = true;
			}
		});
	socket.emit('ReadyForBrokerage');
	setTimeout(function() {
		enableControls = true;
	}, 2000);
	},
	update: function() {
		if(enableControls === true) {
			controls(self, arrows, buttons);
			for(var i = 0; i < connections.length; i++) {
				connections[i].send(currentInstance());
			}
		}
		game.physics.arcade.collide(self,  players);
	}
};

function dataPlexor(data, connection) {
	switch(data.type) {
		case 'InitialPacket':
		console.log('InitialPacket');
			var notSelf = others[data.id];
			notSelf.x = data.initialX;
			notSelf.y = data.initialY;
			notSelf.tint = data.color;
			connection.send({
				type: 'InitialResponse',
				id: ID,
				vector: {
					x: self.x,
					y: self.y,
					xVel: self.body.velocity.x,
					yVel: self.body.velocity.y
				},
				ammo: self.ammo,
				tint: self.tint,
			});
		break;
		case 'InitialResponse':
		console.log('InitialResponse');
			var player = players.create(data.vector.x, data.vector.y, 'pixel');
			player.scale.setTo(20,20);
			player.anchor.setTo(0.5,0.5);
			player.body.collideWorldBounds = true;
			player.tint = data.tint;
			player.ammo = data.ammo;
			player.body.velocity.x = data.vector.xVel;
			player.body.velocity.y = data.vector.yVel;
			player.id = data.id;
			player.Dodge = Dodge;
			player.Slash = Slash;
			player.Shoot = Shoot;

			//WILL NEED TO BE LOOKED AT
			//========================
			player.canShoot = true;
			player.canDodge = true;
			player.canKnife = true;
			player.strafing = false;
			player.directionX = 1;
			player.directionY = 1;
			//========================
			//Possible solution, control lock for two seconds upon spawn

			others[data.id] = player;
			console.log(others);
			console.log(connections);
		break;
		case 'Update':
			var player = others[data.id];
			if(authority === true) {
				//Check correct values
				//check ammo
				//check position
			}
			controls(player, data.keyboard, data.buttons);
		break;
	}
}

function Dodge(directionX, directionY) {
	this.animating = true;
	var z = 0;
	var _this = this;
	//Play animation
	var interval = setInterval(function() {
		//Give a sense of dynamic momentum
		_this.body.velocity.x = (-20*z + 275) * directionX;
		_this.body.velocity.y = (-20*z + 275) * directionY;
		z++;
		if(z >= 10) {
			clearInterval(interval);
			_this.animating = false;
		}
	}, 50);
}

function Slash(directionX, directionY) {
	this.animating = true;
	this.body.velocity.x = 0;
	this.body.velocity.y = 0;
	var x = this.x;
	var y = this.y;
	var knife = game.add.sprite(x, y,'pixel');
	knife.scale.setTo(30, 3);
	knife.tint = 0xa0a0a0;
	knife.angle = Math.atan(directionY/directionX)*180/Math.PI - 52;
	knife.angle = (directionX < 0 ? knife.angle += 180 : knife.angle);
	var z = 0;
	var _this = this;
	var interval = setInterval(function() {
		knife.x = _this.x;
		knife.y = _this.y;
		knife.angle += 10;
		z++;
		if(z >= 11) {
			knife.destroy();
			_this.animating = false;
			clearInterval(interval);
		}
	}, 25);
}

function Shoot(directionX, directionY) {
	var x = directionX*15 + this.x;
	var y = directionY*15 + this.y;
	var newBullet = activeBullets.create(x, y, 'pixel');
	game.physics.arcade.enable(newBullet);
	newBullet.scale.setTo(10, 5);
	newBullet.anchor.setTo(0.5, 0.5);
	newBullet.tint = 0xffd700;
	newBullet.angle = Math.atan(directionY / directionX)*180/Math.PI;
	newBullet.body.velocity.x = directionX*500;
	newBullet.body.velocity.y = directionY*500;
	setTimeout(function() {newBullet.destroy()}, 1500);
}

function currentInstance() {
	var data = {};
	data.type = 'Update';
	data.id = ID;
	data.keyboard = {
		up: {isDown:arrows.up.isDown, isUp:arrows.up.isUp},
		down: {isDown:arrows.down.isDown, isUp:arrows.down.isUp},
		left: {isDown:arrows.left.isDown, isUp:arrows.left.isUp},
		right: {isDown:arrows.right.isDown, isUp:arrows.right.isUp}
	};
	data.buttons = {
		shoot: {isDown:buttons.shoot.isDown},
		slash: {isDown:buttons.slash.isDown},
		dodge: {isDown:buttons.dodge.isDown},
		strafe: {isDown:buttons.strafe.isDown}
	};
	data.vector = {
		x: self.x,
		y: self.y,
		xVel: self.body.velocity.x,
		yVel: self.body.velocity.y
	};
	data.ammo = self.ammo;
	return data;
}

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '0x';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

game.state.add('sync', syncState, true);
game.state.add('game', gameState, false);
module.exports = game;