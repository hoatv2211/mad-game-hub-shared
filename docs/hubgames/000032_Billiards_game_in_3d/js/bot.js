var Bot = function() {
    console.log('bot');
};

Bot.prototype = {
    construct: Bot,
    turn: function() {
        //console.log('botTurn', eightballgame.sides.player2);
        if (eightballgame.state == 'gameover') {
            return;

        }
        var point;
        switch (eightballgame.sides.player2) {
            case '?':
                point = this.getHitPoint();
                break;

            case 'solid':
                point = this.getHitPoint('solid');
                break;

            case 'striped':
                point = this.getHitPoint('striped');
                break;

            default:

                break;
        }
        //var point = this.getHitPoint();
        let forward = new THREE.Vector3();
        forward.copy(point).sub(Game.mainBall.mesh.position);
        forward.y = -15;
        forward.normalize();
        Game.mainBall.forward.copy(forward);
        Game.mainBall.hitForward(100);
        let sound = (Math.random() > 0.5) ? 'hitcue05' : 'hitcue06';
        if (!Game.mute) {
            document.getElementById(sound).play();
        }
        eightballgame.hitButtonClicked();
        var angle = Math.atan2(forward.x, forward.z);
        Game.cam_rot[2] = (angle + 90) * 180 / Math.PI;
        this.inAim = 0;
        Game.cue.position.z = 0;


    },

    getHitPoint: function(type) {
        console.log('ballsType', type);
        var balls = Game.balls;
        var mindist, ball, curdist, hollpos = new THREE.Vector3();
        var holls = this.getHolls();
        for (var i in balls) {
            if (!balls[i].dropped) {
                if (!type || (type == 'solid' && i < 8) || (type == 'striped' && i > 8) || (type == '8' && i == 8))
                    for (var h in holls) {
                        curdist = balls[i].mesh.position.distanceTo(holls[h]);

                        if (!mindist || curdist < mindist) {
                            //console.log(curdist);
                            mindist = curdist;
                            hollpos.copy(holls[h]);
                            ball = balls[i];
                        }
                    }

            }
        }
        var point = new THREE.Vector3();
        //console.log(ball);
        if (!ball) {
            ball = balls[8];
            for (var h in holls) {
                curdist = ball.mesh.position.distanceTo(holls[h]);

                if (!mindist || curdist < mindist) {
                    mindist = curdist;
                    hollpos.copy(holls[h]);

                }
            }

        }
        point.copy(ball.mesh.position).sub(hollpos).normalize()
            .multiplyScalar(Ball.RADIUS * 1.9).add(ball.mesh.position);
        return point;


    },

    getHolls: function() {
        return [
            new THREE.Vector3(Table.LEN_X / 2 + 1.5, 0, -Table.LEN_Z / 2 - 1.5, Math.PI / 4),
            new THREE.Vector3(-Table.LEN_X / 2 - 1.5, 0, -Table.LEN_Z / 2 - 1.5, -Math.PI / 4),
            new THREE.Vector3(0, 0, -Table.LEN_Z / 2 - 4.8, 0),
            new THREE.Vector3(0, 0, Table.LEN_Z / 2 + 4.8, Math.PI),
            new THREE.Vector3(Table.LEN_X / 2 + 1.5, 0, Table.LEN_Z / 2 + 1.5, 3 * Math.PI / 4),
            new THREE.Vector3(-Table.LEN_X / 2 - 1.5, 0, Table.LEN_Z / 2 + 1.5, -3 * Math.PI / 4)
        ];

    },
    aim: function() {
        if (eightballgame.state == 'gameover') {
            return;
        }
        var point;
        switch (eightballgame.sides.player2) {
            case '?':
                point = this.getHitPoint();
                break;

            case 'solid':
                point = this.getHitPoint('solid');
                break;

            case 'striped':
                point = this.getHitPoint('striped');
                break;

            default:

                break;
        }
        //var point = this.getHitPoint();
        let forward = new THREE.Vector3();
        forward.copy(point).sub(Game.mainBall.mesh.position);
        forward.y = -15;
        forward.normalize();
        let angle = -Math.atan2(forward.x, forward.z) * 180 / Math.PI - 90;
        Game.cam_rot[eightballgame.getPlayerId()] = angle;
        Game.updateCam();
        this.inAim = 1;
        Game.cue.position.z = 0;
        //Game.mainBall.forward.copy(forward);
    }
};