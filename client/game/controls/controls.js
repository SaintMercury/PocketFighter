module.exports = function controls(object, controller) {
	if(controller.left.isDown && controller.right.isUp) {
		object.body.velocity.x = -100;
	} 
	else if(controller.left.isUp && controller.right.isDown) {
		object.body.velocity.x = 100;
	} else {
		object.body.velocity.x = 0;
	}

	if(controller.up.isDown && controller.down.isUp) {
		object.body.velocity.y = -100;
	} 
	else if(controller.up.isUp && controller.down.isDown) {
		object.body.velocity.y = 100;
	} else {
		object.body.velocity.y = 0;
	}
};