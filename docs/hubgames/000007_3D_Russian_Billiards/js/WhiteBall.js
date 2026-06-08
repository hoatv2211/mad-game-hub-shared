var WhiteBall = function (x, y, z) {
    //this.name = '0';

    this.cueball = true;
    this.color = 0x7F3300;
    this.defaultPosition = new CANNON.Vec3(-Table.LEN_X / 4, Ball.RADIUS, 0);
    // Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    Ball.call(
        this,
        this.defaultPosition.x,
        this.defaultPosition.y,
        this.defaultPosition.z,
        '0',
        this.color
    );
    this.respown = true;

    this.forward = new THREE.Vector3(1, 0, 0);
    this.forwardLine = this.createForwardLine();
    Game.scene.add(this.forwardLine);

    this.forwardLine2 = this.createForwardLine();
    this.forwardLine2.geometry.vertices[1].x = 0;
    this.forwardLine2.geometry.vertices[1].z = 90;
    this.forwardLine2.material.color.set(0x00ff00);

    /*var rangeGeo = new THREE.Geometry();
    rangeGeo.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-50, 0, 100),
        new THREE.Vector3(50, 0, 100)
    );
    rangeGeo.faces.push(new THREE.Face3(0, 1, 2));

    let vShader = [
        'varying float dist; ',
        'void main() {',
        '	vec3 pos = position; ',
        '   dist = length(pos);   ',
        '	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',
        '	gl_Position = projectionMatrix * mvPosition;',
        '}'

    ].join('\n');

    fragmentShader = [
        'varying float dist;',



        'const vec3  color = vec3( 0.0, 1.0, 0.0 );',
        'void main( void ) {',

        '	float attenuation = 1.0 - smoothstep( 0.0, 75.0, dist );',
        '	float opacity = mix( 0.0, 1.0, attenuation );',
        '   opacity = min(0.3, opacity);',

        '	gl_FragColor = vec4(color, opacity);',
        '}'
    ].join('\n');

    this.forwardLine2 = new THREE.Mesh(
        rangeGeo,
        new THREE.ShaderMaterial({
                vertexShader: vShader,
                fragmentShader: fragmentShader,
                transparent: true,
                side: 2
            }

        )
       
    );*/
    //this.forwardLine2.geometry
    Game.scene.add(this.forwardLine2);



    this.forwardLine3 = this.createForwardLine();
    this.forwardLine3.geometry.vertices[1].x = 0;
    this.forwardLine3.geometry.vertices[1].z = 20;
    //Game.scene.add(this.forwardLine3);

    //this.dot = this.createIntersectionDot();
    //Game.scene.add(this.dot);
    //console.log(this.mesh);
    this.hitMesh = this.mesh.clone();
    this.hitMesh.material = this.hitMesh.material.clone();
    this.hitMesh.material.transparent = true;
    this.hitMesh.material.opacity = 0.5;
    this.hitMesh.castShadow = false;
    Game.scene.add(this.hitMesh);

};

WhiteBall.prototype = Object.create(Ball.prototype);
WhiteBall.prototype.constructor = WhiteBall;

/** Applies a force to this ball to make it move.
    The strength of the force is given by the argument
    The force is the balls "forward" vector, applied at the
    edge of the ball in the opposite direction of the "forward"
*/
WhiteBall.prototype.hitForward = function (strength) {
    Game.mainBallSelected = false;
    this.active = true;
    this.hitBall = false;
    this.rigidBody.wakeUp();
    var ballPoint = new CANNON.Vec3();
    ballPoint.copy(this.rigidBody.position);

    var vec = new CANNON.Vec3();
    vec.copy(this.forward);

    vec.normalize();
    vec.scale(Ball.RADIUS, vec);
    ballPoint.vsub(vec, ballPoint);

    var force = new CANNON.Vec3();
    force.copy(this.forward.normalize());
    force.scale(strength, force);
    this.rigidBody.applyImpulse(force, ballPoint);
    this.respown = false;
    this.droped = false;
    eightballgame.hitCount++;
};

/** Resets the position to this.defaultPosition */
WhiteBall.prototype.onEnterHole = function () {
    this.rigidBody.velocity = new CANNON.Vec3(0);
    this.rigidBody.angularVelocity = new CANNON.Vec3(0);
    this.droped = true;

    if (this.hitBall) {
        Game.world.removeBody(this.rigidBody);
        this.mesh.visible = false;
        if (eightballgame) {
            eightballgame.coloredBallEnteredHole(this.name);
        }
        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    } else {
        //respown

    }

    /*this.respown = true;
    this.droped = true;
    this.rigidBody.position.y = -5 * Ball.RADIUS;
    this.mesh.position.y = -5 * Ball.RADIUS;
    var SLEEPING = true;
    for (var i in Game.balls) {
        if (Game.balls[i].mesh.visible && Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING) {
            //console.log('not sleeping');
            SLEEPING = false;
            break;
        }
    }
    if (SLEEPING) {
        this.mute = false;
        this.rigidBody.position.copy(this.defaultPosition);
        eightballgame.whiteBallEnteredHole();
    } else {
        this.mute = true;
        this.fallen = false;
    }*/
};

WhiteBall.prototype.tick = function (dt) {
    this.mesh.position.copy(this.rigidBody.position);
    this.mesh.quaternion.copy(this.rigidBody.quaternion);

    //update intersection dot if were not moving
    var SLEEPING = true;
    for (var i in Game.balls) {
        if (Game.balls[i].mesh.visible && Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING) {
            //console.log(i, Game.balls[i].rigidBody.sleepState, CANNON.Body.SLEEPING);
            if (i != 0) {
                SLEEPING = false;

                break;
            }
        } else {
            //console.log(Game.balls[i].mesh.position);
            /*if (Game.balls[i].mesh.visible && Game.balls[i].mesh.position.y > 3.6) {

             

                eightballgame.pocketingOccurred = false;

            }*/
        }
    }

    if (!this.hitBall && !SLEEPING) {
        this.hitBall = true;
    }

    if (this.rigidBody.position.y < -2 * Ball.RADIUS && !this.droped) {
        this.droped = true;
        //this.fallen = true;
        //let sound = (Math.random() > 0.5) ? 'dropcue07' : 'dropcue08'
        this.needRespown = false;
        if (this.rigidBody.position.x < Game.box.min.x) {
            this.needRespown = true;
        }

        if (this.rigidBody.position.z < Game.box.min.z) {
            this.needRespown = true;

        }

        if (this.rigidBody.position.x > Game.box.max.x) {
            this.needRespown = true;
        }

        if (this.rigidBody.position.z > Game.box.max.z) {
            this.needRespown = true;
        }

        if (!this.needRespown) {
            if (!Game.mute && !this.mute && !window.blured) {
                document.getElementById('dropcue09').play();
            }
            if (this.hitBall) {
                this.onEnterHole();
            } else {
                this.rigidBody.velocity = new CANNON.Vec3(0);
                this.rigidBody.angularVelocity = new CANNON.Vec3(0);
                this.active = false;
                Game.respownBall(0);
                eightballgame.setPenalty();
            }
        } else {

            console.log('main ball out', this.rigidBody.position, Game.box.min, Game.box.max);
            this.rigidBody.velocity = new CANNON.Vec3(0);
            this.rigidBody.angularVelocity = new CANNON.Vec3(0);
            Game.world.removeBody(this.rigidBody);
            console.log(this.name);
            eightballgame.addRespown(this.name);
            this.mesh.visible = false;
            this.active = false;
            eightballgame.setPenalty();
            Game.setText(translates["ballOut"]);
            return;

        }

    }

    if (SLEEPING && (this.rigidBody.sleepState == CANNON.Body.SLEEPING || this.droped) && eightballgame.state != 'gameover' && eightballgame.endDelay <= 0) {
        if (!this.forwardLine.visible) {
            this.forwardLine.visible = true;
            this.hitMesh.visible = true;
        }
        this.active = false;

        Game.cueWrap.visible = true;

        if ((Game.curMode === 0 && eightballgame.getPlayerId() == 2) || !Game.mainBallSelected) {

            //this.forwardLine.visible = false;
            this.updateGuideLine(true);
            //this.updateIntersectionDot();
            $('#hitRound, #roundDummy').hide();
            if (!Game.mainBallSelected && ((Game.curMode === 0 && eightballgame.getPlayerId() == 1) || Game.curMode !== 0)) {
                Game.cueWrap.visible = false;
                this.hitMesh.visible = false;
                this.forwardLine.visible = false;
                this.forwardLine2.visible = false;
                this.forwardLine3.visible = false;
            }

        } else {
            this.updateGuideLine();
            this.updateIntersectionDot();

            $('#hitRound, #roundDummy').show();

        }
    } else {
        // console.log(SLEEPING, this.rigidBody.sleepState, CANNON.Body.SLEEPING);
        this.active = true;
        if (this.forwardLine.visible) {
            this.forwardLine.visible = false;
            this.forwardLine2.visible = false;
            this.forwardLine3.visible = false;
            this.hitMesh.visible = false;
        }
        $('#hitRound, #roundDummy').hide();
        //console.log(this.mesh.position.y);

        Game.cueWrap.visible = false;
    }
};

WhiteBall.prototype.createIntersectionDot = function () {
    var geometry = new THREE.SphereGeometry(1, 4, 4);
    var material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true, color: 0xffff00 });
    var sphere = new THREE.Mesh(geometry, material);

    return sphere;
};
WhiteBall.prototype.updateIntersectionDot = function () {
    //this.dot.position.copy(this.intersectionPoint);
};



WhiteBall.prototype.updateGuideLine = function () {

    //var angle = controls.getAzimuthalAngle() + Math.PI / 2;
    var angle = -Game.cam_rot[eightballgame.getPlayerId()] * Math.PI / 180 + Math.PI;
    //console.log(angle);

    this.forward.set(Math.cos(angle), 0, -Math.sin(angle));

    this.forwardLine.position.copy(this.mesh.position);

    this.forwardLine.rotation.y = angle;
    this.forward.normalize();


    // Go through each ball
    var distances = [];
    for (var i in Game.balls) {
        // find the distance to that ball
        if (i != '0') {
            distances.push({
                index: i,
                dist: Math.abs(this.mesh.position.distanceTo(Game.balls[i].mesh.position))
            });
        }
    }

    //sort the according to distance
    distances.sort(function (a, b) { return a.dist - b.dist; });

    //iterate again, to find the closest intersecting ball
    var intersectingBallIndex = -1;
    var sphere = new THREE.Sphere();
    for (var j = 0; j < distances.length; j++) {
        var ballIndex = distances[j].index;
        var curBall = Game.balls[ballIndex];
        sphere.copy(curBall.sphere);
        sphere.radius *= 1.98;
        if (this.forwardLine.ray.intersectsSphere(sphere)) {
            intersectingBallIndex = ballIndex;
            break;
        }
    }
    //This could possibly be optimized with some more clever usage of THREE js-s offered functions (look into Ray, etc)


    if (intersectingBallIndex == -1) {
        // We're intersecting with the edge of the table
        this.intersectionPoint = this.forwardLine.ray.intersectBox(this.forwardLine.box);
        if (this.intersectionPoint) {
            let dist = this.mesh.position.distanceTo(this.intersectionPoint);
            let vec = new THREE.Vector3().copy(this.intersectionPoint).sub(this.mesh.position).normalize().multiplyScalar(dist - 3.5);
            this.hitMesh.position.copy(this.mesh.position).add(vec);
            this.forwardLine2.visible = false;
            this.forwardLine3.visible = false;
        }
    } else {
        // Otherwise we are aiming at some ball
        sphere.copy(Game.balls[intersectingBallIndex].sphere);
        sphere.radius *= 1.98;
        this.intersectionPoint = this.forwardLine.ray.intersectSphere(sphere);
        this.hitMesh.position.copy(this.intersectionPoint);
        let v3 = new THREE.Vector3().copy(this.intersectionPoint).sub(this.mesh.position).normalize();

        let v1 = new THREE.Vector3().copy(Game.balls[intersectingBallIndex].mesh.position).sub(this.intersectionPoint)
            .normalize();

        let v1_90 = new THREE.Vector3().copy(v1).applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        let v3inv = new THREE.Vector3().copy(v3).multiplyScalar(-1);

        let angle = Math.atan2(v3inv.x, v3inv.z) - Math.atan2(v1_90.x, v1_90.z);
        //console.log(angle);
        let v_main = new THREE.Vector3().copy(v1).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2 - angle);

        let dif = new THREE.Vector3().copy(v1).sub(v3);

        dif = dif.length();
        let rate = (1.3 - dif) / 1.3;
        //console.log(rate);

        v1.multiplyScalar(10).add(this.intersectionPoint);
        this.forwardLine2.position.copy(this.intersectionPoint);
        this.forwardLine2.lookAt(v1);
        this.forwardLine2.visible = true;

        v1.sub(this.intersectionPoint);
        v1.normalize();
        let vDif = new THREE.Vector3().copy(this.forward).sub(v1);

        /*let length = vDif.length();
        length = Math.max(0.05, length);
        this.forwardLine2.geometry.vertices[1].x = 50 * length;
        this.forwardLine2.geometry.vertices[2].x = -50 * length;
        this.forwardLine2.geometry.verticesNeedUpdate = true;*/


        let v2 = new THREE.Vector3().copy(this.intersectionPoint).sub(Game.balls[intersectingBallIndex].mesh.position).normalize().multiplyScalar(rate);



        v2.add(v3).multiplyScalar(10).add(this.intersectionPoint);

        v_main.multiplyScalar(10).add(this.intersectionPoint);

        this.forwardLine3.position.copy(this.intersectionPoint);
        this.forwardLine3.lookAt(v_main);
        this.forwardLine3.visible = false;
        //console.log(Game.balls[intersectingBallIndex].sphere);
    }

    if (this.intersectionPoint) {
        var distance = Math.sqrt(this.mesh.position.distanceToSquared(this.intersectionPoint));

        this.forwardLine.geometry.vertices[1].x = distance;
        this.forwardLine.geometry.verticesNeedUpdate = true;
    }
};

WhiteBall.prototype.createForwardLine = function () {
    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;

    vertArray.push(new THREE.Vector3(0, 0, 0));
    vertArray.push(new THREE.Vector3(85, 0, 0));
    lineGeometry.computeLineDistances();
    var lineMaterial = new THREE.LineDashedMaterial({ color: 0xdddddd, dashSize: 4, gapSize: 2, linewidth: 3, });
    var line = new THREE.Line(lineGeometry, lineMaterial);
    line.position.copy(new THREE.Vector3(100, 100, 100)); //hide it somewhere initially
    line.box = new THREE.Box3(
        new THREE.Vector3(-Table.LEN_X / 2, 0, -Table.LEN_Z / 2),
        new THREE.Vector3(Table.LEN_X / 2, 2 * Ball.RADIUS, Table.LEN_Z / 2)
    );

    line.ray = new THREE.Ray(this.mesh.position, this.forward);

    return line;
};