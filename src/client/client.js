//Don't remove th io() because fuck you
var socket = io();

//Event emitters/recievers
socket.on('connected', function(obj) {
	console.log(obj.data);
});