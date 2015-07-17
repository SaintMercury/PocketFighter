module.exports = function controls(object, controller) {
	if(controller.left.isDown && controller.right.isUp) {
		object.x += -1;
	} 
	else if(controller.left.isUp && controller.right.isDown) {
		object.x += 1;
	}

	if(controller.up.isDown && controller.down.isUp) {
		object.y += -1;
	} 
	else if(controller.up.isUp && controller.down.isDown) {
		object.y += 1;
	}
};