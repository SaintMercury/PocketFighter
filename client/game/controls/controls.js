var canShoot = true;
var canDodge = true;
var canKnife = true;
var strafing = false;
var directionX = 1;
var directionY = 1;

module.exports = function controls(object, controller1, controller2) {
	//Strafing
	if(controller2.strafe.isDown) {
		strafing = true;
	} else {
		strafing = false;
	}

	//Movement
	if(controller1.left.isDown && controller1.right.isUp) {
		object.body.velocity.x = -100;
		if(strafing === false) {
			directionX = -1;
			directionY = 0;
		}
	} 
	else if(controller1.left.isUp && controller1.right.isDown) {
		object.body.velocity.x = 100;
		if(strafing === false) {
			directionX = 1;
			directionY = 0;
		}
	} else {
		object.body.velocity.x = 0;
	}

	if(controller1.up.isDown && controller1.down.isUp) {
		object.body.velocity.y = -100;
		if(strafing === false) {
			directionY = -1;
			directionX = 0;
		}
	} 
	else if(controller1.up.isUp && controller1.down.isDown) {
		object.body.velocity.y = 100;
		if(strafing === false) {
			directionY = 1;
			directionX = 0;
		}
	} else {
		object.body.velocity.y = 0;
	}
	if(object.body.velocity.x !== 0 && object.body.velocity.y !== 0) {
		object.body.velocity.x *= Math.sqrt(2)/2;
		object.body.velocity.y *= Math.sqrt(2)/2;
		if(strafing === false) {
			directionX = (Math.sqrt(2)/2)*Math.abs(object.body.velocity.x)/object.body.velocity.x;
			directionY = (Math.sqrt(2)/2)*Math.abs(object.body.velocity.y)/object.body.velocity.y;
		}
	}

	//Actions
	//None of these actions can go off at the same time
	if(controller2.dodge.isDown && canDodge === true) {
		canDodge = false;
		if(strafing === true) {
			var newX = Math.abs(object.body.velocity.x)/(object.body.velocity.x ? object.body.velocity.x : 1);
			var newY = Math.abs(object.body.velocity.y)/(object.body.velocity.y ? object.body.velocity.y : 1);
			object.Dodge(newX, newY);
		} else {
			object.Dodge(directionX, directionY);
		}
		setTimeout(function() {canDodge = true; console.log('I can Dodge');}, 2000);
	} else
	if(controller2.shoot.isDown && canShoot === true && object.ammo > 0) {
		canShoot = false;
		object.ammo--;
		if(object.body.velocity.x === 0 && object.body.velocity.y === 0) {
			object.Shoot(directionX, directionY);
			setTimeout(function () {canShoot = true; console.log('I can shoot');}, 150);
		} else {
			object.Shoot(directionX, directionY);
			setTimeout(function () {canShoot = true; console.log('I can shoot');}, 500);
		}
	} else
	if(controller2.slash.isDown && canKnife === true) {
		canKnife = false;
		object.Slash(directionX, directionY);
		setTimeout(function() {canKnife = true; console.log('I can knife');}, 500);
	}
};