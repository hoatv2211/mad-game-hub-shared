var Ball = function (x, y, z, name, color) {
    this.color = typeof color === 'undefined' ? 0xffffff : color; //default color
    //this.texture = 'images/balls/' + name + '.png';
    this.texture = name;
    this.name = name;

    this.mesh = this.createMesh(x, y, z);
    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS); //used for guiding line intersection detecting
    Game.scene.add(this.mesh);

    this.rigidBody = this.createBody(x, y, z);
    this.rigidBody.addEventListener("collide", function (e) {
        //document.getElementById('board01').play();
        //
        //console.log(e);

    });
    console.log(this.rigidBody);

    Game.world.addBody(this.rigidBody);

    this.fallen = false;
    console.log(Ball.contactMaterial);

    this.shPos = new THREE.Vector3();
    this.shForce = new THREE.Vector3();
    this.shTorque = new THREE.Vector3();
    this.shVelo = new THREE.Vector3();
    this.shAngVelo = new THREE.Vector3();
    this.shQuat = new THREE.Quaternion();

};

//Ball.RADIUS = 1.21 * 5.815 / 2; // cm
Ball.RADIUS = 6.8 / 2;
Ball.MASS = 0.170; // kg
Ball.contactMaterial = new CANNON.Material("ballMaterial");

/** Load env map for the ball.
  TODO: find a nicer place to do this. */
/*Ball.envMapUrls = [
    'images/skybox1/px.png', // positive x
    'images/skybox1/nx.png', // negative x
    'images/skybox1/py.png', // positive y
    'images/skybox1/ny.png', // negative y
    'images/skybox1/pz.png', // positive z
    'images/skybox1/nz.png' // negative z
];*/

//var cubeTextureLoader = new THREE.CubeTextureLoader();
/*Ball.envMap = cubeTextureLoader.load(Ball.envMapUrls, function(tex) {
    Ball.envMap = tex;
});*/

Ball.prototype.calcShadowPos = function (dt) {
    this.shPos.copy(this.rigidBody.position);

    this.shForce.copy(this.rigidBody.force);
    this.shTorque.copy(this.rigidBody.torque);
    //this.shAngVelo.copy(this.rigidBody.angularVelocity);
    this.shVelo.copy(this.rigidBody.velocity);
    let invMass = this.rigidBody.invMass

    this.shVelo.x += this.shForce.x * invMass * dt;
    this.shVelo.y += this.shForce.y * invMass * dt;
    this.shVelo.z += this.shForce.z * invMass * dt;

    this.shPos.x += this.shVelo.x * dt;
    this.shPos.y += this.shVelo.y * dt;
    this.shPos.z += this.shVelo.z * dt;

    //console.log(this.shPos)
};

Ball.prototype.checkPreCollision = function (balls) {
    let minDist;
    for (let i in balls) {
        if (this.name != balls[i].name) {
            let dist = this.shPos.distanceTo(balls[i].shPos);
            if (!minDist && minDist > dist) {
                minDist = dist;
            }

        }
    }

    if (minDist < Ball.RADIUS * 2) {
        return (minDist / Ball.RADIUS * 2) * 1.01;
    }
    return;

};

Ball.prototype.onEnterHole = function () {
    this.rigidBody.velocity = new CANNON.Vec3(0);
    this.rigidBody.angularVelocity = new CANNON.Vec3(0);
    Game.world.removeBody(this.rigidBody);
    //console.log('enter hole');
    this.mesh.visible = false;
    //rules.onDrop(this.texture);
    this.dropped = true;
    if (eightballgame) {
        eightballgame.coloredBallEnteredHole(this.name);
    }
    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

};

Ball.prototype.createBody = function (x, y, z) {
    var sphereBody = new CANNON.Body({
        mass: Ball.MASS, // kg
        position: new CANNON.Vec3(x, y, z), // m
        shape: new CANNON.Sphere(Ball.RADIUS),
        material: Ball.contactMaterial
    });

    sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
    sphereBody.allowSleep = true;

    // Sleep parameters
    sphereBody.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
    sphereBody.sleepTimeLimit = 0.1; // Body falls asleep after 1s of sleepiness

    return sphereBody;
};

Ball.prototype.createMesh = function (x, y, z) {
    //Game.ballGeo;
    var geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
    var material = new THREE.MeshPhongMaterial({
        specular: 0xffffff,
        shininess: 140,
        reflectivity: 0.1,
        map: Game.ballTextures[this.name],
        //envMap: Ball.envMap,
        combine: THREE.AddOperation,
        color: this.color
        //shading: THREE.SmoothShading
    });

    console.log(Game.ballTextures[this.name], this.name);

    /*if (typeof this.texture === 'undefined') {
      material.color = new THREE.Color(this.color);
    } else {
      textureLoader.load(this.texture, function (tex) {
        material.map = tex;
        material.needsUpdate = true;
      });
    }*/
    //material.map = Game.ballTextures[this.texture];

    var sphere = new THREE.Mesh(geometry, material);
    //sphere.scale.set(1.1, 1.1, 1.1);

    sphere.position.set(x, y, z);

    sphere.castShadow = true;
    sphere.receiveShadow = true;

    return sphere;
};

Ball.prototype.tick = function (dt) {
    this.mesh.position.copy(this.rigidBody.position);
    this.mesh.quaternion.copy(this.rigidBody.quaternion);

    // Has the ball fallen into a hole?

    if (this.rigidBody.position.y < -2 * Ball.RADIUS && !this.droped) {
        this.droped = true;
        //this.fallen = true;
        //let sound = (Math.random() > 0.5) ? 'dropcue07' : 'dropcue08'
        this.respown = false;
        if (this.rigidBody.position.x < Game.box.min.x) {
            this.respown = true;
        }

        if (this.rigidBody.position.z < Game.box.min.z) {
            this.respown = true;

        }

        if (this.rigidBody.position.x > Game.box.max.x) {
            this.respown = true;
        }

        if (this.rigidBody.position.z > Game.box.max.z) {
            this.respown = true;
        }

        if (!this.respown) {
            if (!Game.mute && !this.mute && !window.blured) {
                document.getElementById('dropcue09').play();
            }
            this.onEnterHole();
        } else {
            //console.log('ball out');
            console.log('ball out', this.rigidBody.position, Game.box.min, Game.box.max);
            console.log(this.rigidBody.sleepState, CANNON.Body.SLEEPING, this.rigidBody.velocity);
            this.rigidBody.velocity = new CANNON.Vec3(0);
            this.rigidBody.angularVelocity = new CANNON.Vec3(0);
            Game.world.removeBody(this.rigidBody);
            this.mesh.visible = false;
            eightballgame.addRespown(this.name);
            eightballgame.setPenalty();
            //Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING

            Game.setText(translates["ballOut"]);
        }



    }
};