var Bot = function () {
    console.log('bot');
    this.hitPoint;
    this.forward;
    this.power = 0;
};

Bot.prototype = {
    construct: Bot,
    turn: function () {
        //alert('botturn');
        console.log('botTurn', eightballgame.sides.player2);
        if (eightballgame.state == 'gameover') {
            return;

        }
        /*var point;
        point = this.getHitPoint();


        //var point = this.getHitPoint();
        let forward = new THREE.Vector3();
        forward.copy(point).sub(Game.mainBall.rigidBody.position);
        forward.y = -15;

        forward.normalize();
        console.log(point, forward, Game.mainBall.rigidBody.position);*/
        var point = this.point;
        var forward = this.forward;

        Game.mainBall.forward.copy(forward);
        //console.log(this.power);
        this.power = Math.max(20, this.power);
        if (Math.random() < 0.15) {
            this.power = 100;
        }
        Game.mainBall.hitForward(this.power);
        let sound = (Math.random() > 0.5) ? 'hitcue05' : 'hitcue06';
        if (!Game.mute && !window.blured) {
            document.getElementById(sound).play();
        }
        eightballgame.hitButtonClicked();
        var angle = Math.atan2(forward.x, forward.z);
        Game.cam_rot[2] = (angle + 90) * 180 / Math.PI;
        this.inAim = 0;
        Game.cue.position.z = 0;


    },

    setCueBall: function (pos, n, hole) {
        var mindist, cueball;
        var balls = Game.balls;

        let hVec = new THREE.Vector3().copy(hole).sub(pos).normalize();
        let dif = new THREE.Vector3();

        for (var i in balls) {
            if (!balls[i].dropped && balls[i].mesh.visible) {
                if (i != n) {
                    /*let dist = balls[i].mesh.position.distanceTo(pos);
                    if (!mindist || mindist < dist) {
                        cueball = i;
                    }*/
                    dif.copy(pos).sub(balls[i].mesh.position).normalize().add(hVec)
                    let len = dif.length();
                    console.log('vector len', len)
                    if (!mindist || mindist < len) {
                        cueball = i;
                        mindist = len;

                    }
                }
            }
        }

        let len2 = pos.distanceTo(balls[cueball].mesh.position);
        len2 = Math.min(100, len2);
        //console.log(len2);
        this.power += 50 * (len2 / 100);
        // console.log('setCuebal', balls[cueball]);
        //alert('setCuebal');
        Game.switchMainBall(cueball);
    },

    getHitPoint: function () {
        //alert('');
        var balls = Game.balls;
        var mindist, ball, curdist, hollpos = new THREE.Vector3();
        var holls = this.getHolls();
        let ballN;
        let rnd = Math.random();
        for (var i in balls) {
            if (!balls[i].dropped && balls[i].mesh.visible) {
                if (rnd > 0.6) {

                    for (var h in holls) {
                        curdist = balls[i].mesh.position.distanceTo(holls[h]);

                        if (!mindist || curdist < mindist) {
                            //console.log(curdist);
                            mindist = curdist;
                            hollpos.copy(holls[h]);
                            ball = balls[i];
                            ballN = i;
                        }
                    }
                } else {
                    let h = Math.floor(Math.random() * 6);
                    curdist = balls[i].mesh.position.distanceTo(holls[h]);

                    if (!mindist || curdist < mindist) {
                        //console.log(curdist);
                        mindist = curdist;
                        hollpos.copy(holls[h]);
                        ball = balls[i];
                        ballN = i;
                    }
                }

            }
        }

        let len1 = hollpos.distanceTo(ball.mesh.position);
        len1 = Math.min(100, len1);
        //console.log(len1);
        this.power = 50 * (len1 / 100);


        this.setCueBall(ball.mesh.position, ballN, hollpos);

        var point = new THREE.Vector3();
        //console.log(ball);

        point.copy(ball.mesh.position).sub(hollpos).normalize()
            .multiplyScalar(Ball.RADIUS * 1.9).add(ball.mesh.position);
        return point;


    },

    getHolls: function () {
        return [
            new THREE.Vector3(Table.LEN_X / 2 + 1.5, 0, -Table.LEN_Z / 2 - 1.5, Math.PI / 4),
            new THREE.Vector3(-Table.LEN_X / 2 - 1.5, 0, -Table.LEN_Z / 2 - 1.5, -Math.PI / 4),
            new THREE.Vector3(0, 0, -Table.LEN_Z / 2 - 4.8, 0),
            new THREE.Vector3(0, 0, Table.LEN_Z / 2 + 4.8, Math.PI),
            new THREE.Vector3(Table.LEN_X / 2 + 1.5, 0, Table.LEN_Z / 2 + 1.5, 3 * Math.PI / 4),
            new THREE.Vector3(-Table.LEN_X / 2 - 1.5, 0, Table.LEN_Z / 2 + 1.5, -3 * Math.PI / 4)
        ];

    },
    aim: function () {
        //alert('botaim');
        if (eightballgame.state == 'gameover') {
            return;
        }
        console.log('bot aim');

        var point = this.getHitPoint();
        let forward = new THREE.Vector3();
        forward.copy(point).sub(Game.mainBall.rigidBody.position);
        forward.y = -15;
        forward.normalize();
        let angle = -Math.atan2(forward.x, forward.z) * 180 / Math.PI - 90;
        Game.cam_rot[eightballgame.getPlayerId()] = angle;
        Game.updateCam();
        this.inAim = 1;
        Game.cue.position.z = 0;
        console.log(point, forward, Game.mainBall.rigidBody.position);
        this.point = point;
        this.forward = forward;
        //Game.mainBall.forward.copy(forward);
    }
};