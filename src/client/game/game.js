var game = new Phaser.Game(800, 600, Phaser.Auto, '', {preload: preload, create: create, update: update});

var counter = 0;
var count = 0;
function preload() {
	socket.emit('gameLoad', {data: 'I am loading in'});
};
function create() {};
function update() {
	//Update speed seems to be about 60 fps
	counter++;
	if(counter === 60) {
		counter = 0;
		count++
		socket.emit('update', count);
	}
};