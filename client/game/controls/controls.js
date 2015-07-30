module.exports = function controls(object, controller1, controller2) {
	//Strafing
	if(controller2.strafe.isDown) {
		object.strafing = true;
	} else {
		object.strafing = false;
	}

	//Movement
	if(controller1.left.isDown && controller1.right.isUp) {
		object.body.velocity.x = -100;
		if(object.strafing === false) {
			object.directionX = -1;
			object.directionY = 0;
		}
	} 
	else if(controller1.left.isUp && controller1.right.isDown) {
		object.body.velocity.x = 100;
		if(object.strafing === false) {
			object.directionX = 1;
			object.directionY = 0;
		}
	} else {
		object.body.velocity.x = 0;
	}

	if(controller1.up.isDown && controller1.down.isUp) {
		object.body.velocity.y = -100;
		if(object.strafing === false) {
			object.directionY = -1;
			object.directionX = 0;
		}
	} 
	else if(controller1.up.isUp && controller1.down.isDown) {
		object.body.velocity.y = 100;
		if(object.strafing === false) {
			object.directionY = 1;
			object.directionX = 0;
		}
	} else {
		object.body.velocity.y = 0;
	}
	if(object.body.velocity.x !== 0 && object.body.velocity.y !== 0) {
		object.body.velocity.x *= Math.sqrt(2)/2;
		object.body.velocity.y *= Math.sqrt(2)/2;
		if(object.strafing === false) {
			object.directionX = (Math.sqrt(2)/2)*Math.abs(object.body.velocity.x)/object.body.velocity.x;
			object.directionY = (Math.sqrt(2)/2)*Math.abs(object.body.velocity.y)/object.body.velocity.y;
		}
	}

	//Actions
	//None of these actions can go off at the same time
	if(controller2.dodge.isDown && object.canDodge === true) {
		object.canDodge = false;
		if(object.strafing === true) {
			var newX = Math.abs(object.body.velocity.x)/(object.body.velocity.x ? object.body.velocity.x : 1);
			var newY = Math.abs(object.body.velocity.y)/(object.body.velocity.y ? object.body.velocity.y : 1);
			object.Dodge(newX, newY);
		} else {
			object.Dodge(object.directionX, object.directionY);
		}
		setTimeout(function() {object.canDodge = true; console.log('I can Dodge');}, 2000);
	} else
	if(controller2.shoot.isDown && object.canShoot === true && object.ammo > 0) {
		object.canShoot = false;
		object.ammo--;
		if(object.body.velocity.x === 0 && object.body.velocity.y === 0) {
			object.Shoot(object.directionX, object.directionY);
			setTimeout(function () {object.canShoot = true; console.log('I can shoot');}, 150);
		} else {
			object.Shoot(object.directionX, object.directionY);
			setTimeout(function () {object.canShoot = true; console.log('I can shoot');}, 500);
		}
	} else
	if(controller2.slash.isDown && object.canKnife === true) {
		object.canKnife = false;
		object.Slash(object.directionX, object.directionY);
		setTimeout(function() {object.canKnife = true; console.log('I can knife');}, 500);
	}
};