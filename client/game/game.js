var socket = require('./socket.js');
var controls = require('./controls/controls.js');

var game;
game = new Phaser.Game(800, 600, Phaser.Auto, '', {preload: preload, create: create, update: update});

//Needed globals for game
var players;
var self;
var others;
var keys;

//Initialize
function preload() {
	//pre setup
	console.log(game.load.image('pixel','/Assets/Textures/pixel.png'));

	//Assign event recievers here.
	socket.on('connected', function(data) {
		joinHandler(data);
	});
	socket.on('clientUpdate', function(data) {
		clientUpdate(data);
	});
	socket.on('userDisconnect', function(data) {
		leaveHandler(data);
	})
}

function create() {
	players = game.add.group();
	self = players.create(game.world.randomX, game.world.randomY, 'pixel');
	self.scale.setTo(20,20);
	self.anchor.setTo(0.5,0.5); //I think this centers the object's reference
	self.tint = 0xff0000;

	others = {};

	keys = game.input.keyboard.createCursorKeys();
}

function update() {
	controls(self,keys);
	serverUpdate();
}

function clientUpdate(data) {
	var bud;
	if(!!others[data.socketid] === false) {
		bud = others[data.socketid] = players.create(data.x, data.y, 'pixel');
		bud.scale.setTo(20,20);
		bud.anchor.setTo(0.5,0.5);
		bud.tint = 0x00ff00;
	} else {
	 bud = others[data.socketid];
	}
	bud.x = data.x;
	bud.y = data.y;
}

function serverUpdate() {
	var data = {
		socketid: socket.id,
		x: self.x,
		y: self.y
	};
	socket.emit('serverUpdate', data);
}

function joinHandler(data) {
	var bud = players.create(game.world.randomX, game.world.randomY, 'pixel');
	bud.scale.setTo(20,20);
	bud.anchor.setTo(0.5,0.5);
	bud.tint = 0x00ff00;
	others[data.socketid] = bud;
}

function leaveHandler(data) {
	others[data.socketid].destroy();
	delete others[data.socketid];
}

module.exports = game;