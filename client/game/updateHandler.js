// Handles event updates from host/clients
//	data - the data recieved by either host of client
//	connection - the connection(s) to the host/client
//	hostBool - check if we are host or not

function updateHandler(data, otherPlayers, hostBool) {
	if(hostBool === true) {
		if(otherPlayers[data.id] !== undefined) {
			otherPlayers[data.id].x = data.x;
			otherPlayers[data.id].y = data.y;
		}
	} else {
		for(var i in data) {
			if(otherPlayers[i] !== undefined && i !== 'type') {
				otherPlayers[i].x = data[i].x;
				otherPlayers[i].y = data[i].y;
			}
		}
	}
}

module.exports = updateHandler;