'use-strict';
var socket = require('./socket.js');
var controls = require('./controls/controls.js');
var updateHandler = require('./updateHandler.js');
var newJoinHendler = require('./newJoinHandler.js');

var game = new Phaser.Game(800, 600, Phaser.Auto, '');

var self;
var otherPlayers = {};
var activeBullets;
var drops;
var keys; //Controls
var actions;

var gameState = {
	preload: function() {
		console.log('GAME');
		game.load.image('pixel', '/Assets/Textures/pixel.png');
		game.physics.startSystem(Phaser.Physics.ARCADE);
	},
	create: function() {
		//Base game stuff
		activeBullets = game.add.group();
		drops = game.add.group();
		players = game.add.group();
		players.enableBody = true;
		self = players.create(game.world.randomX, game.world.randomY, 'pixel');
		self.scale.setTo(20,20);
		self.anchor.setTo(0.5,0.5);
		self.tint = 0xff0000;
		game.physics.arcade.enable(self);
		self.body.collideWorldBounds = true;
		keys = game.input.keyboard.createCursorKeys();
		actions = game.input.keyboard.addKeys({'dodge': Phaser.Keyboard.C, 'shoot': Phaser.Keyboard.Z, 'slash': Phaser.Keyboard.X, 'strafe': Phaser.Keyboard.SPACEBAR});
		self.animating = false;
		self.Dodge = Dodge;
		self.Shoot = Shoot;
		self.ammo = 6;
		self.Slash = Slash;
	},
	update: function() {
		game.physics.arcade.collide(players, players);
		if(self.animating === false) {
			controls(self,keys,actions);
		}
	}
};

function Dodge(directionX, directionY) {
	this.animating = true;
	var z = 0;
	var _this = this;
	//Play animation
	var interval = setInterval(function() {
		//Give a sense of dynamic momentum
		_this.body.velocity.x = (-400*(z/20) + 250) * directionX;
		_this.body.velocity.y = (-400*(z/20) + 250) * directionY;
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

game.state.add('game', gameState, true);

module.exports = game;