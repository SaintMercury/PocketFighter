//Handler for new connections. Tells all previous connections that someone knew joined.

function newJoinHandler(data, otherPlayers, group, sprite, connections, hostBool, ID, game) {
	if(data.id !== ID) {
		console.log('Making a new player object');
		otherPlayers[data.id] = group.create(data.x, data.y, sprite);
		var newGuy = otherPlayers[data.id];
		newGuy.scale.setTo(20,20);
		newGuy.anchor.setTo(0.5,0.5);
		newGuy.tint = 0x00ff00;
		game.physics.arcade.enable(newGuy);
		if(hostBool === true) {
			console.log('sending over recieved player data');
			for(var i in connections) {
				connections[i].send({type: 'NewJoin', id: data.id, x:newGuy.x, y:newGuy.y});
			}
		}
	}
}

module.exports = newJoinHandler;