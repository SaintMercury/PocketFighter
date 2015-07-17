function serverUpdate(socket, data) {
	var newData ={};
	socket.emit('clientUpdate', newData);
}

module.exports = serverUpdate;