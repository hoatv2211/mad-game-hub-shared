'use strict';
//Physijs.scripts.worker = 'js/physijs_worker.js';
//Physijs.scripts.ammo = 'ammo.js';
var eightballgame, gui, debug = false;
const Game = {

    cols: [],
    rc: new THREE.Raycaster(),
    gameField: new Array(),
    curTurn: 1,
    curMode: 0,
    gameOver: false,
    //board: new THREE.Group(),
    balls: {},
    arrowPlace: 0,
    controls: false,
    mute: false,
    loadingcount: 6,
    cam_rot: { '1': 180 + Math.random(), '2': 180 + Math.random() },
    rotate: false,
    hit: false,
    mousePos: { x: 0, y: 0 },
    cueShift: 0,
    prevCueShift: 0,
    ballTextures: {},
    curMousePos: new THREE.Vector2(),
    cueTrace: [],
    stat: new Image(),
    opAngle: 0,
    paused: false,

    init: function() {
        //this.stat.src = 'http://lisgames.ru/stat.jpg';
        this.world = new CANNON.World();
        this.world.gravity.set(0, 30 * -9.82, 0); // m/s²

        this.world.solver.iterations = 10;
        this.world.solver.tolerance = 0; // Force solver to use all iterations

        // Allow sleeping
        this.world.allowSleep = true;

        //this.world.fixedTimeStep = 1.0 / 60.0; // seconds
        this.world.defaultContactMaterial.friction = 0.1;
        this.world.defaultContactMaterial.restitution = 0.85;

        var ball_floor = new CANNON.ContactMaterial(
            Ball.contactMaterial,
            Table.floorContactMaterial, { friction: 0.7, restitution: 0.1 }
        );

        var ball_wall = new CANNON.ContactMaterial(
            Ball.contactMaterial,
            Table.wallContactMaterial, { friction: 0.5, restitution: 0.9 }
        );

        this.world.addContactMaterial(ball_floor);
        this.world.addContactMaterial(ball_wall);


        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.autoClear = false;
        //this.renderer.setPixelRatio(window.devicePixelRatio);

        if (device.mobile() || device.tablet()) {
            this.renderer.shadowMap.enabled = false;
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        //this.renderer.shadowMap.renderReverseSided = false;

        let path = "data/";
        var format = '.jpg';



        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(65, ($('#world').width() / $('#world').height()), 10, 1000);
        this.camera.position.set(0, 150, 68);
        this.camera.lookAt(new THREE.Vector3(0, 0, 18));


        this.scene.add(this.camera);

        this.scene2 = new THREE.Scene();



        var spotlight = new THREE.SpotLight(0xffffe5, 1);

        spotlight.position.set(0, 120, 0);
        spotlight.target.position.set(0, 0, 0); //the light points directly towards the xz plane
        spotlight.target.updateMatrixWorld();

        spotlight.castShadow = true;
        spotlight.shadowCameraFov = 110;
        spotlight.shadowCameraNear = 10;
        spotlight.shadowCameraFar = 170;
        spotlight.shadowMapWidth = 1024;
        spotlight.shadowMapHeight = 1024;
        spotlight.penumbra = 0.5;
        this.scene.add(spotlight);
        spotlight.target.updateMatrixWorld();

        var spotLight2 = spotlight.clone();
        spotLight2.castShadow = false;
        this.scene2.add(spotLight2);

        this.scene.add(new THREE.AmbientLight(0x777777));
        this.scene2.add(new THREE.AmbientLight(0x777777));

        this.clock = new THREE.Clock();


        $('#world').append(this.renderer.domElement);
        this.resize();

        window.addEventListener('resize', this.resize.bind(this), false);
        if (device.mobile() || device.tablet()) {
            this.texture = new THREE.TextureLoader().load('data/dif1024.jpg', this.loaded.bind(this));
            this.lightMap = new THREE.TextureLoader().load('data/lightMap.jpg', this.loaded.bind(this));
        } else {
            this.texture = new THREE.TextureLoader().load('data/bill_Material__2_AlbedoTransparency.jpg', this.loaded.bind(this));
        }
        if (!device.mobile() && !device.tablet()) {
            this.normal = new THREE.TextureLoader().load('data/bill_Material__2_Normal.png', this.loaded.bind(this));
            //this.spec = new THREE.TextureLoader().load('data/bill_Material__2_SpecularSmoothness.jpg', this.loaded.bind(this));
            this.texture.anisotropy = 8;
            this.normal.anisotropy = 8;
        }
        //this.texture.wrapS = this.texture.wrapT = THREE.MirroredRepeatWrapping;



        this.cueTexture = new THREE.TextureLoader().load('data/Cue.jpg', this.loaded.bind(this));




        let colors = ['#FEED01',
            '#182983',
            '#E53118',
            '#93117E',
            '#EF7F01',
            '#00914E',
            '#871421',
            '#000000',
            '#FEED01',
            '#182983',
            '#E53118',
            '#93117E',
            '#EF7F01',
            '#00914E',
            '#871421',
        ];
        let bheight = $('#ballsplace').height();
        for (let i = 1; i < 16; i++) {
            let canvas = document.createElement("canvas");
            if (canvas.getContext) {
                let ctx = canvas.getContext('2d');
                ctx.canvas.width = 256;
                ctx.canvas.height = 256;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 256, 256);
                ctx.fillStyle = colors[i - 1];
                let padding = 0;
                if (i > 8) {
                    padding = 40;

                }
                ctx.fillRect(0, 0 + padding, 256, 256 - padding * 2);

                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let radius = 60;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.font = "76px Tahoma";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText(i, 128, 128);

                this.ballTextures[i] = new THREE.Texture(canvas);
                this.ballTextures[i].anisotropy = 16;
                this.ballTextures[i].needsUpdate = true;
                /*if (i < 8) {
                    let img = $('<img/>');
                    $(img).attr('src', this.ballTextures[i].image.toDataURL());
                    $('#player1balls').append(img);

                }*/
                //console.log(this.ballTextures[i]);


            }
        }
        this.resizeBallsGui();

        let loader = new THREE.OBJLoader();
        if (!device.mobile() && !device.tablet()) {
            loader.load('data/bill.obj', function(obj) {
                //console.log(obj);
                obj.children[0].geometry.center();


                obj.children[0].material = new THREE.MeshStandardMaterial({
                    map: Game.texture,
                    normalMap: Game.normal,
                    /*specularMap: Game.spec,*/
                    metalness: 0,
                    roughness: 0.8
                });


                //obj.children[0].material.reflectivity = 0.7;

                obj.children[0].castShadow = true;
                obj.children[0].receiveShadow = true;

                obj.castShadow = true;
                obj.scale.set(0.429, 0.425, 0.421);
                obj.position.y = -28.6;
                Game.scene.add(obj);

                var narrowStripWidth = 2;
                var narrowStripLength = 140 / 2 - 5;
                var floorThickness = 1;
                var mainAreaX = 270 / 2 - 2 * narrowStripWidth;

                var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.LEN_Z / 2 - 1));
                var floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength + 2));
                var floorBoxSmall2 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength));
                var floorBoxSmall3 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength + 8));

                var body = new CANNON.Body({
                    mass: 0, // mass == 0 makes the body static
                    material: Table.floorContactMaterial
                });
                body.addShape(floorBox, new CANNON.Vec3(0, -floorThickness, 0));
                body.addShape(floorBoxSmall, new CANNON.Vec3(-mainAreaX - narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall, new CANNON.Vec3(mainAreaX + narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall2, new CANNON.Vec3(-mainAreaX - narrowStripWidth * 3, -floorThickness, 0));
                body.addShape(floorBoxSmall2, new CANNON.Vec3(mainAreaX + narrowStripWidth * 3, -floorThickness, 0));
                body.addShape(floorBoxSmall3, new CANNON.Vec3(-mainAreaX + narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall3, new CANNON.Vec3(mainAreaX - narrowStripWidth, -floorThickness, 0));

                if (debug) {
                    addCannonVisual(body, 0xff0000);
                }
                Game.world.add(body);

                var hole1 = new Hole(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4, Math.PI / 4);
                var hole2 = new Hole(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5.4, -Math.PI / 4);
                //middle holes
                var hole3 = new Hole(0, 0, -Table.LEN_Z / 2 - 6.9, 0);
                var hole4 = new Hole(0, 0, Table.LEN_Z / 2 + 6.9, Math.PI);
                //corners of +x table side
                var hole5 = new Hole(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4, 3 * Math.PI / 4);
                var hole6 = new Hole(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4, -3 * Math.PI / 4);

                var wall1 = new LongWall(Table.LEN_X / 4 - 0.8, 2, -Table.LEN_Z / 2, 61);
                var wall2 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, -Table.LEN_Z / 2, 61);
                wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);

                //walls of -z
                var wall3 = new LongWall(Table.LEN_X / 4 - 0.8, 2, Table.LEN_Z / 2, 61);
                var wall4 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, Table.LEN_Z / 2, 61);
                wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
                wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

                //wall of +x
                var wall5 = new ShortWall(Table.LEN_X / 2, 2, 0, 60.5);

                //wall of -x
                var wall6 = new ShortWall(-Table.LEN_X / 2, 2, 0, 60.5);
                wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5 * Math.PI);

                var walls = [wall1, wall2, wall3, wall4, wall5, wall6];
                for (var i in walls) {
                    Game.world.addBody(walls[i].body);
                    if (debug) {
                        addCannonVisual(walls[i].body);
                    }
                }





                Game.loaded();
                //Game.scene.add(table);
                Game.render();
                gui = new GameGui();
            });
        } else {
            loader.load('data/bill2.obj', function(obj) {
                console.log(obj);
                obj.children[0].geometry.center();

                obj.children[0].geometry.attributes.uv2 = obj.children[0].geometry.attributes.uv;

                let vert_uni_path = [
                    'varying vec3 v_FragmentPosition;'
                ].join('\n');

                let frag_uni_path = [
                    'varying vec3 v_FragmentPosition;',
                    'uniform vec3 balls_pos [16];',
                    'const vec3  shadowColor = vec3( 0.1, 0.1, 0.1 );',
                ].join('\n');

                let vert_path = [
                    '	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
                    '	v_FragmentPosition = worldPosition.xyz;'
                ].join('\n');

                let frag_path = [
                    '	float distance = 65534.0;',
                    '   float cur_distance = 0.0;',
                    '   vec3 L = vec3(0, 0, 0);',
                    '	for ( int i = 0; i < 16; i ++ ) {',
                    '		L = balls_pos[i] - v_FragmentPosition;',
                    '		cur_distance = length( L );',
                    '		distance = min(distance, cur_distance);',

                    '	}',
                    '	float shadowAttenuation = 1.0 - smoothstep( 0.0, 5.5, distance );',
                    '	gl_FragColor.rgb =  mix( gl_FragColor.rgb, shadowColor, shadowAttenuation );'
                ].join('\n');

                let vert = [

                    '#define USE_MAP',
                    '#define USE_LIGHTMAP',


                    THREE.ShaderLib.basic.vertexShader
                ].join('\n');

                vert = vert.replace('#include <fog_pars_vertex>', vert_uni_path);
                vert = vert.replace('#include <fog_vertex>', vert_path);

                let frag = [

                    '#define USE_MAP',
                    '#define USE_LIGHTMAP',


                    THREE.ShaderLib.basic.fragmentShader
                ].join('\n');

                frag = frag.replace('#include <fog_pars_fragment>', frag_uni_path);
                frag = frag.replace('#include <fog_fragment>', frag_path);

                let uniforms = THREE.UniformsUtils.merge([THREE.ShaderLib.basic.uniforms, {
                    balls_pos: {
                        type: 'v3v',
                        value: [new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500),
                            new THREE.Vector3(-500, 0, -500)

                        ]
                    }
                }]);
                Game.balls_pos = uniforms.balls_pos;
                //console.log(uniforms);

                //uniforms.roughness.value = 0.8;
                //uniforms.metalness.value = 0;
                uniforms.map.value = Game.texture;
                uniforms.lightMap.value = Game.lightMap;

                let mat = new THREE.ShaderMaterial({
                    vertexShader: vert,
                    fragmentShader: frag,
                    uniforms: uniforms,
                    lights: false
                });
                //mat.extensions.derivatives = true;
                //mat = new THREE.MeshBasicMaterial({ map: Game.texture });

                obj.children[0].material = mat;

                //console.log(mat);


                //obj.children[0].material.reflectivity = 0.7;


                obj.scale.set(0.429, 0.425, 0.421);
                obj.position.y = -28.6;
                Game.scene.add(obj);

                var narrowStripWidth = 2;
                var narrowStripLength = 140 / 2 - 5;
                var floorThickness = 1;
                var mainAreaX = 270 / 2 - 2 * narrowStripWidth;

                var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.LEN_Z / 2 - 1));
                var floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength + 2));
                var floorBoxSmall2 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength));
                var floorBoxSmall3 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength + 8));

                var body = new CANNON.Body({
                    mass: 0, // mass == 0 makes the body static
                    material: Table.floorContactMaterial
                });
                body.addShape(floorBox, new CANNON.Vec3(0, -floorThickness, 0));
                body.addShape(floorBoxSmall, new CANNON.Vec3(-mainAreaX - narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall, new CANNON.Vec3(mainAreaX + narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall2, new CANNON.Vec3(-mainAreaX - narrowStripWidth * 3, -floorThickness, 0));
                body.addShape(floorBoxSmall2, new CANNON.Vec3(mainAreaX + narrowStripWidth * 3, -floorThickness, 0));
                body.addShape(floorBoxSmall3, new CANNON.Vec3(-mainAreaX + narrowStripWidth, -floorThickness, 0));
                body.addShape(floorBoxSmall3, new CANNON.Vec3(mainAreaX - narrowStripWidth, -floorThickness, 0));

                if (debug) {
                    addCannonVisual(body, 0xff0000);
                }
                Game.world.add(body);

                var hole1 = new Hole(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4, Math.PI / 4);
                var hole2 = new Hole(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5.4, -Math.PI / 4);
                //middle holes
                var hole3 = new Hole(0, 0, -Table.LEN_Z / 2 - 6.9, 0);
                var hole4 = new Hole(0, 0, Table.LEN_Z / 2 + 6.9, Math.PI);
                //corners of +x table side
                var hole5 = new Hole(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4, 3 * Math.PI / 4);
                var hole6 = new Hole(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4, -3 * Math.PI / 4);

                var wall1 = new LongWall(Table.LEN_X / 4 - 0.8, 2, -Table.LEN_Z / 2, 61);
                var wall2 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, -Table.LEN_Z / 2, 61);
                wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);

                //walls of -z
                var wall3 = new LongWall(Table.LEN_X / 4 - 0.8, 2, Table.LEN_Z / 2, 61);
                var wall4 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, Table.LEN_Z / 2, 61);
                wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
                wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

                //wall of +x
                var wall5 = new ShortWall(Table.LEN_X / 2, 2, 0, 60.5);

                //wall of -x
                var wall6 = new ShortWall(-Table.LEN_X / 2, 2, 0, 60.5);
                wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5 * Math.PI);

                var walls = [wall1, wall2, wall3, wall4, wall5, wall6];
                for (var i in walls) {
                    Game.world.addBody(walls[i].body);
                    if (debug) {
                        addCannonVisual(walls[i].body);
                    }
                }





                Game.loaded();
                //Game.scene.add(table);
                Game.render();
                gui = new GameGui();
            });
        }

        let loader2 = new THREE.OBJLoader();
        loader2.load('data/ball.obj', function(obj) {
            obj.children[0].geometry.center()
            Game.ballGeo = obj.children[0].geometry;
            Game.loaded();
        });

        let loader3 = new THREE.OBJLoader();
        loader3.load('data/cue.obj', function(obj) {
            obj.children[0].geometry.center()
                //Game.ballGeo = obj.children[0].geometry;
                //console.log(obj.children[0].material);
            obj.children[0].scale.set(1.5, 1.5, 1.5);
            obj.children[0].position.z = -23;

            obj.children[0].material = new THREE.MeshPhongMaterial({ map: Game.cueTexture });
            Game.cue = obj;
            //Game.cue.children[0].castShadow = true;
            Game.cueWrap.add(obj);
            Game.loaded();
            //console.log(Game.cueTexture);
        });






        this.cueWrap = new THREE.Group();
        //this.cueWrap.add(cue);
        this.scene2.add(this.cueWrap);
        //this.cue = cue;

        /*Game.ysdk.adv.showFullscreenAdv({
            callbacks: {}
        });*/


    },

    render: function() {
        requestAnimationFrame(this.render.bind(this));

        let delta = this.clock.getDelta();
        if (this.paused) {
            return;
        }
        $('#tryrus').css('background-color', 'rgba(255,255,255, ' + (0.3 + Math.sin(this.opAngle) * 0.1) + ')');
        this.opAngle += delta * 3.5;

        let moving = false;
        this.updateCam();

        let balls = [];


        for (let i in this.balls) {
            if (this.balls[i]) {
                balls.push(this.balls[i]);
            }
        }

        if (eightballgame && eightballgame.state != 'gameover') {
            if (this.mainBall && eightballgame) {
                this.mainBall.tick(delta);
                if (this.balls_pos) {
                    this.balls_pos.value[0].copy(this.mainBall.mesh.position);
                    this.balls_pos.value[0].y = 0;
                }

            }

            for (let i in this.balls) {


                this.balls[i].tick(delta);
                if (this.balls_pos) {
                    this.balls_pos.value[i].copy(this.balls[i].mesh.position);
                    this.balls_pos.value[i].y = 0;
                }

            }
        }
        if (eightballgame && eightballgame.state != 'gameover') {
            if (this.bot && this.bot.inAim) {
                if (this.bot.inAim == 1) {
                    this.cue.position.z -= 10 * delta;
                    if (this.cue.position.z < -9) {
                        this.bot.inAim = 2;
                    }
                } else {
                    this.cue.position.z += 120 * delta;
                }
            }
        }
        if (this.mainBall) {
            balls.push(this.mainBall);
        }

        this.renderer.render(this.scene, this.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.scene2, this.camera);
        //this.world.step(Math.min(delta, 1 / 20));


        for (let i in balls) {
            if (!balls[i]) {
                console.log(i);
            }
            balls[i].calcShadowPos(1 / 60);
            //console.log(this.balls[i].shPos);
        }

        let dtmod = 1;
        for (let i in this.balls) {
            if (this.balls[i].mesh.visible && this.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING) {
                let mod = this.balls[i].checkPreCollision(this.balls);
                if (mod) {
                    dtmod = Math.min(dtmod, mod);
                }
            }
        }
        this.world.step(1 / 60 * dtmod);


        //this.world.step(1 / 60);
        //console.log(delta, 1 / 60);

        if (eightballgame && eightballgame.state !== 'gameover') {
            if (this.curMode === 0) {
                if (eightballgame.getPlayerId() === 1) {
                    let side = ''
                    if (eightballgame.sides.player1 != '?') {
                        if (eightballgame.sides.player1 == 'solid') {
                            side = '(цельные)';
                            if (eightballgame.solidDrop.length == 7) {
                                $('#hit8').show();
                            } else {
                                $('#hit8').hide();
                            }
                        } else {
                            side = '(полосатые)';
                            if (eightballgame.stripedDrop.length == 7) {
                                $('#hit8').show();
                            } else {
                                $('#hit8').hide();
                            }
                        }

                    } else {
                        $('#hit8').hide();
                    }

                    $('#curTurn').text('Player ' + side);
                } else {
                    $('#hit8').hide();
                    let side = '';
                    if (eightballgame.sides.player2 != '?') {
                        if (eightballgame.sides.player2 == 'solid') {
                            side = '(solid)';

                        } else {
                            side = '(striped)';

                        }
                    }
                    $('#curTurn').text('Robot ' + side);
                }
            } else {
                let side = '';
                if (eightballgame.sides[eightballgame.turn] != '?') {
                    if (eightballgame.sides[eightballgame.turn] == 'solid') {
                        side = ' (solid)';
                        if (eightballgame.solidDrop.length == 7) {
                            $('#hit8').show();
                        } else {
                            $('#hit8').hide();
                        }
                    } else {
                        side = ' (striped)';
                        if (eightballgame.stripedDrop.length == 7) {
                            $('#hit8').show();
                        } else {
                            $('#hit8').hide();
                        }
                    }
                } else {
                    $('#hit8').hide();
                }
                $('#curTurn').text('Player ' + eightballgame.getPlayerId() + side);

            }

            if (eightballgame.sides.player1 != '?') {
                if (eightballgame.getPlayerId() === 1) {
                    $('#player1balls, #player1escBalls').show();
                    $('#player2balls, #player2escBalls').hide();
                } else {
                    $('#player1balls, #player1escBalls').hide();
                    $('#player2balls, #player2escBalls').show();
                }
            } else {
                $('#player1balls, #player2balls').hide();
            }




        } else {
            $('#hit8').hide();
        }




    },

    resize: function() {
        //if (this.width != window.innerWidth || this.height != window.innerHeight) {

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        $('#world canvas').css('width', window.innerWidth + 'px').css('height', window.innerHeight + 'px');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        /*if (this.width < this.height) {
            this.camera.fov = 110;
        } else {
            this.camera.fov = 75;
        }*/
        this.camera.updateProjectionMatrix();


        let winWidth = $(window).width();
        let winHeight = $(window).height();

        let height = $('#ballsplace').height();
        $('#player1balls,  #player2balls, #player1escBalls, #player2escBalls').width($('#ballsplace').width());
        $('#curTurn').width($('#ballsplace').width());

        let mmHeight, mmWidth;
        if (this.width > this.height) {
            $('#tryrus').css('bottom', '3%');
            mmHeight = this.height * 0.7;
            mmWidth = mmHeight;
        } else {
            mmHeight = this.width * 0.9;
            mmWidth = mmHeight;
            $('#tryrus').css('bottom', '11%');
        }


        //mmWidth = Math.min(mmWidth, winWidth);
        //mmHeight = mmWidth / 1.3;
        //$('#howToPlay').css('margin-left', -$('#howToPlay').width() / 2 + 'px');

        $('#mainmenu').width(mmWidth).height(mmHeight)
            .css('left', ((winWidth - mmWidth) / 2) + 'px')
            .css('top', ((winHeight - mmHeight) / 2) + 'px');


        let gmHeight = $('#mainmenu').height();
        let gmWidth = (gmHeight * 0.8);
        gmWidth = Math.min(gmWidth, winWidth);
        gmHeight = gmWidth / 0.8;

        $('#gameEnd').width(gmWidth)
            .css('left', ((winWidth - gmWidth) / 2) + 'px')
            .css('top', ((winHeight - gmHeight) / 2) + 'px');

        let butWidth = $('#sound').width();
        $('#sound, #exit, #restart, #fullScreen').height(butWidth);
        if (!device.mobile() && !device.tablet()) {
            $('#sound').css('right', butWidth * .2 + 'px');
            $('#exit').css('right', butWidth * 1.4 + 'px');
            $('#restart').css('right', butWidth * 2.6 + 'px');
            $('#sound').css('top', '1%');
        } else {
            $('#sound').css('bottom', '1%');
            $('#exit').css('right', butWidth * .2 + 'px');
            $('#restart').css('right', butWidth * 1.4 + 'px');
        }

        if (device.mobile()) {
            $('#hitRound, #roundDummy').height('13%');
        }

        //$('#hitArrow').css('margin-left', -$('#hitArrow').width() / 2 + 'px');

        $('#hitRound, #roundDummy').css('margin-left', -$('#hitRound').width() / 2 + 'px');
        let hitlineWidth = 0.08488063660477453581;
        if (device.mobile()) {
            $('#hitRound').height('13%');
            hitlineWidth *= 2.5;
        }

        $('#roundDummy').width($('#hitRound').width()).height($('#hitRound').height());

        $('#hitLine').width($('#hitLine').height() * hitlineWidth);
        $('#hitLine').css('margin-left', -$('#hitLine').width() / 2 + 'px');

        let butWidth2 = $('#exit2').width();
        $('#exit2, #restart2').height(butWidth2);
        /*if (this.width < this.height) {
            $('#mode_wrap').css('height', '20%');
        } else {
            $('#mode_wrap').css('height', '30%');
        }*/
        $('#mode_wrap').css('height', '20%');

        let htpMargin = -$('#howToPlay').width() / 2;
        if ($('#fullScreen').width() * 1.2 > (this.width - $('#howToPlay').width()) / 2) {
            htpMargin += $('#fullScreen').width() * 1.2 - (this.width - $('#howToPlay').width()) / 2;

        }
        console.log(htpMargin);
        $('#howToPlay').css('margin-left', htpMargin + 'px');
        $('#powerBorder, #powerWrap').css('margin-bottom', -$('#powerBorder').height() / 2).width(0.132 * $('#powerBorder').height());
        $('#power').css('background-size', $('#powerBorder').width() + 'px ' + $('#powerBorder').height() + 'px');

        $('#looser').height($('#looser').width());
        this.resizeBallsGui();

        //}

    },

    cursorUpdate: function(rowX, rowY) {
        if (!this.hit && !this.rotation) {
            if (!device.mobile() && !device.tablet() && this.cueWrap.visible) {
                //console.log(this.cue);
                $('canvas').removeClass('cursorHit');
                $('canvas').removeClass('cursorRot');
                //console.log(this.mousePos);
                this.rc.setFromCamera(new THREE.Vector3((rowX / window.innerWidth) * 2 - 1, -(rowY / window.innerHeight) * 2 + 1, 0.9), this.camera);
                this.rc.far = 20000;
                let intersects = this.rc.intersectObject(this.cue.children[0]);
                if (intersects.length) {
                    $('canvas').addClass('cursorCueHover');

                } else {
                    $('canvas').removeClass('cursorCueHover');
                }
            }
        } else {
            if (!device.mobile() && !device.tablet()) {
                $('canvas').removeClass('cursorCueHover');
                if (this.hit) {
                    $('canvas').addClass('cursorHit');
                } else {
                    $('canvas').removeClass('cursorHit');
                }

                if (this.rotation) {
                    $('canvas').addClass('cursorRot');
                } else {
                    $('canvas').removeClass('cursorRot');
                }
            }


        }


    },

    mouseMove: function(rowX, rowY) {
		if(eightballgame.state==null){
			return;
		}
        if (!this.controls || !eightballgame || eightballgame.state == 'gameover') {
            return;
        }

        if (this.curMode === 0 && eightballgame.getPlayerId() == 2) {
            return;
        }
        this.cursorUpdate(rowX, rowY);


        if (this.rotation) {
            let speed = 1;
            if (this.hit) {
                speed = 0.1;
            }
            //console.log(this.mousePos);
            let deltaX = this.mousePos.x - rowX;
            this.mousePos.x = rowX;
            this.mousePos.y = rowY;
            this.cam_rot[eightballgame.getPlayerId()] += (deltaX / this.width) * ((device.mobile()) ? 90 : 180) * speed;
            if (this.mainBall.respown) {
                this.cam_rot[eightballgame.getPlayerId()] = Math.min(270, this.cam_rot[eightballgame.getPlayerId()]);
                this.cam_rot[eightballgame.getPlayerId()] = Math.max(90, this.cam_rot[eightballgame.getPlayerId()]);

            }
        }

        //this.updateCam();
        //}
        this.cue.position.z = this.cueShift * 50;
        if (this.hit) {
            let maxY = window.innerHeight - 40 * window.innerHeight / 100;
            let minY = maxY - $('#hitRound').height();
            if (rowY > maxY) {
                let power = (rowY - maxY) / (this.height * 40 / 100);
                this.cue.position.z = -30 * power;
                $('#hitLine div').height(power * 100 + '%');
                $('#power').height($('#powerBorder').height() * power + 'px');
            }

        }
    },

    updateCam: function() {
        if (this.mainBall && eightballgame) {
            let rot = this.cam_rot[eightballgame.getPlayerId()] * Math.PI / 180;
            let x = Math.cos(rot) * 80;
            let y = Math.sin(rot) * 80;
            if ((this.curMode === 0 && eightballgame.getPlayerId() == 2) || (this.mainBall.active) || eightballgame.state == 'gameover') {
                if (this.width > this.height) {
                    this.camera.position.set(0, 150, 50);
                } else {
                    this.camera.position.set(-100, 300, 0);
                }
                this.camera.lookAt(new THREE.Vector3());
                this.cueWrap.position.copy(this.mainBall.mesh.position);
                this.cueWrap.position.x += x;
                this.cueWrap.position.z += y;
                this.cueWrap.position.y = 5;
                this.cueWrap.lookAt(this.mainBall.mesh.position);

            } else {

                this.camera.position.copy(this.mainBall.mesh.position);
                this.camera.position.x += x;
                this.camera.position.z += y;
                if (this.width < this.height) {
                    this.camera.position.y += 55;
                } else {
                    this.camera.position.y += 55;
                }
                //this.camera.position.y += 2;
                //this.camera.position.y = 0;
                this.camera.lookAt(this.mainBall.mesh.position);
                //this.cueWrap.position.copy(this.camera.position);
                this.cueWrap.position.copy(this.mainBall.mesh.position);
                this.cueWrap.position.x += Math.cos(rot) * 50;
                this.cueWrap.position.z += Math.sin(rot) * 50;
                //console.log('test');

                if (this.width < this.height) {
                    this.cueWrap.position.y = 20;
                } else {
                    this.cueWrap.position.y = 25;
                }
                this.cueWrap.lookAt(this.mainBall.mesh.position);
            }

        }

    },

    isMyTurn: function() {
        return ((this.curMode == 0 && eightballgame.getPlayerId() == 1) || this.curMode == 1);
    },
    mouseClick: function(x, y) {
		if(eightballgame.state==null){
			return;
		}
        if (!this.controls || eightballgame.state == 'gameover') {
            return;
        }



        this.hit = false;
        this.rotation = true;
        let minX = window.innerWidth / 2 - $('#hitRound').width() / 2;
        let maxX = window.innerWidth / 2 + $('#hitRound').width() / 2;
        let maxY = window.innerHeight - 40 * window.innerHeight / 100;
        let minY = maxY - $('#hitRound').height();
        //console.log(minX, maxX, minY, maxY, x, y);
        if (this.cueWrap.visible) {
            if (y >= minY && y <= maxY && x >= minX && x <= maxX) {
                this.hit = true;
                $('#powerBorder, #powerWrap').show();
                $('#power').height(0);
                //this.rotation = false;
                let width = $('#hitRound').width();
                let height = $('#hitRound').height();
                let bottom = 40 * this.height / 100 + height / 2;


                $('#hitAnim').width($('#hitRound').width() * 1.9 + 'px');
                $('#hitAnim').height($('#hitRound').height() * 1.9 + 'px');
                $('#hitAnim').css('margin-left', -$('#hitAnim').width() / 2 + 'px')
                    .css('bottom', bottom + 'px')
                    .css('margin-bottom', -$('#hitAnim').height() / 2 + 'px');

                $('#hitAnim').show();
                $('#hitAnim div').addClass('round');
            } else {
                this.mousePos.x = x;
            }
        }



        this.mousePos.y = y;
        this.mousePos.x = x;

    },

    mouseUp: function(x, y) {
		if(eightballgame.state==null){
			return;
		}
        if (!this.controls || eightballgame.state == 'gameover') {
            //console.log('!controls');
            return;
        }

        $('#hitAnim').hide();
        $('#hitAnim div').removeClass('round');

        if (this.hit) {
            let maxY = window.innerHeight - 40 * window.innerHeight / 100;
            let minY = maxY - $('#hitRound').height();
            if (this.cueWrap.visible) {
                if (y > maxY) {
                    //this.updateCam();
                    let impulse = 125 * (y - maxY) / (this.height * 40 / 100);
                    let forward = new THREE.Vector3();
                    forward.copy(this.mainBall.mesh.position).sub(this.cueWrap.position);
                    forward.y = 0;
                    forward.normalize();
                    this.mainBall.forward.copy(forward);
                    this.mainBall.hitForward(impulse);
                    eightballgame.hitButtonClicked();
                    let sound = (Math.random() > 0.5) ? 'hitcue05' : 'hitcue06'
                    if (!this.mute) {
                        document.getElementById(sound).play();
                    }
                }
            }
        }

        this.cue.position.z = 0;
        this.rotation = false;
        this.hit = false;
        $('#powerBorder, #powerWrap').hide();
        $('#hitLine div').height(0);

        if (!device.mobile() && !device.tablet()) {
            $('canvas').removeClass('cursorHit');
            $('canvas').removeClass('cursorRot');
        }
    },





    setLastTurn: function(col, row, player, noUpdate) {
        if (player === 2) {
            if (this.lastTurn2[0] != col || this.lastTurn2[1] != row) {
                this.lastTurn2 = [col, row];
                this.lastTurnTimer2 = 0;
                this.lastTurnTotalTimer2 = 0;
                if (!noUpdate) {
                    this.needsUpdateLast2 = true;
                }
            }

        } else {
            if (this.lastTurn1[0] != col || this.lastTurn1[1] != row) {
                this.lastTurn1 = [col, row];
                this.lastTurnTimer1 = 0;
                this.lastTurnTotalTimer1 = 0;
                if (!noUpdate) {
                    this.needsUpdateLast1 = true;
                }
            }


        }
    },



    newgame: function() {
        if (eightballgame) {
            for (var t in eightballgame.timeouts) {
                clearTimeout(eightballgame.timeouts[t]);
            }
            clearInterval(eightballgame.hitInt);
        }
        this.cam_rot = { '1': 180 + Math.random(), '2': 180 + Math.random() };

        eightballgame = new EightBallGame();
        this.startTimer();
        this.lastTurn1 = [-1, -1];
        this.lastTurn2 = [-1, -1];
        this.lastTurnTimer1 = 0;
        this.lastTurnTimer2 = 0;
        this.gameOverTotalTimer = -1;
        this.lastTurnTotalTimer1 = 0;
        this.lastTurnTotalTimer2 = 0;
        this.gameover = false;
        this.currentPlayer = 1;


        for (var i in this.balls) {
            this.scene.remove(this.balls[i].mesh);
            this.world.remove(this.balls[i].rigidBody);
        }
        this.balls = {};
        if (this.mainBall) {
            this.scene.remove(this.mainBall.mesh);
            this.scene.remove(this.mainBall.forwardLine);
            this.world.remove(this.mainBall.rigidBody);
            this.scene.remove(this.mainBall.hitMesh);
            this.scene.remove(this.mainBall.forwardLine2);
        }
        this.mainBall = null;


        this.mainBall = new WhiteBall();

        //console.log(this.mainBall);

        //let r = 3.5;
        let r = Ball.RADIUS;

        let positions = [
            [8 * r, -4 * r],
            [2 * r, r],
            [4 * r, -2 * r],
            [8 * r, 2 * r],

            [6 * r, -r],
            [8 * r, -2 * r],
            [6 * r, 3 * r],
            [4 * r, 0],
            [6 * r, -3 * r],
            [6 * r, r],
            [8 * r, 4 * r],
            [4 * r, 2 * r],
            [8 * r, 0],
            [2 * r, -r],
            [0, 0]

        ];

        for (let i = 1; i < 16; i++) {
            this.balls[i] = new Ball(80 + positions[15 - i][0] - 25, 5, positions[15 - i][1], i);

        }

        this.updateBallsGui();


    },

    setMode: function(mode) {
        this.controls = true;
        this.curMode = mode;
        this.newgame();
        $('#mainmenu').fadeOut();
        $('#timer').fadeIn();
        $('#restart, #exit').fadeIn();
        $('#tryrus').hide();
        $('#curTurn').fadeIn();
        $('#ballsplace ').fadeIn();
        $('#howToPlay').hide();
        if (mode === 0) {
            this.bot = new Bot();
        }
        eightballgame.startTurn();
        if (!this.help) {
            this.controls = false;
            var helpStartWait = setInterval(function() {
                if (!Game.mainBall.active) {
                    setTimeout(function() {


                        $('#hand').show().css('left', '50%').css('bottom', '50%').animate({ left: '50%', bottom: '60%' }, 300)
                            .promise().done(function() {
                                if (device.mobile()) {
                                    $('#hitArrow2').show();
                                }
                                let width = $('#hitRound').width();
                                let height = $('#hitRound').height();
                                let bottom = 60 * Game.height / 100 + height / 2;


                                $('#hitAnim').width($('#hitRound').width() * 1.9 + 'px');
                                $('#hitAnim').height($('#hitRound').height() * 1.9 + 'px');
                                $('#hitAnim').css('margin-left', -$('#hitAnim').width() / 2 + 'px')
                                    .css('bottom', bottom + 'px')
                                    .css('margin-bottom', -$('#hitAnim').height() / 2 + 'px');

                                $('#hitAnim').show();
                                $('#hitAnim div').addClass('round');

                                $('#hand').show().animate({ left: '75%', bottom: '60%' }, 900).promise().done(function() {
                                    $('#hand').show().animate({ left: '15%', bottom: '60%' }, 900).promise().done(function() {
                                        $('#hitArrow2').hide();
                                        $('#hitAnim').hide();
                                    });
                                });


                            })
                    }, 1000);
                    setTimeout(function() {
                        $('#hand').show().animate({ left: '49%', bottom: '39%' }, 1000)
                            .promise().done(function() {
                                let width = $('#hitRound').width();
                                let height = $('#hitRound').height();
                                let bottom = 40 * Game.height / 100 + height / 2;


                                $('#hitAnim').width($('#hitRound').width() * 1.9 + 'px');
                                $('#hitAnim').height($('#hitRound').height() * 1.9 + 'px');
                                $('#hitAnim').css('margin-left', -$('#hitAnim').width() / 2 + 'px')
                                    .css('bottom', bottom + 'px')
                                    .css('margin-bottom', -$('#hitAnim').height() / 2 + 'px');

                                $('#hitAnim').show();
                                $('#powerWrap, #powerBorder').show();
                                $('#hitAnim div').addClass('round');
                                let scope = this;
                                setTimeout(function() {

                                    $(scope).animate({ left: '49%', bottom: '1%', }, {
                                            duration: 1500,
                                            step: function(p, n) {
                                                if (p < 40) {
                                                    let power = (39 - p) / 39;
                                                    Game.cue.position.z = -30 * power;
                                                    $('#hitLine div').height(power * 100 + '%');
                                                    $('#power').height($('#powerBorder').height() * power + 'px');
                                                }
                                            }
                                        })
                                        .promise().done(function() {
                                            $('#hitAnim').hide();
                                            $('#powerWrap, #powerBorder').hide();
                                            $('#hitAnim div').removeClass('round');
                                            $(this).hide();
                                            Game.cue.position.z = 0;
                                            $('#hitLine div').height(0);
                                            $('#power').height(0);
                                            Game.controls = true;
                                        });
                                }, 500);
                            });

                    }, 3200);

                    Game.help = true;
                    clearInterval(helpStartWait);
                }
            }, 10);
        }


        //document.getElementById('bg').currentTime = 0;
        //document.getElementById('bg').play();
    },

    setMute: function() {
        if (this.mute) {
            this.mute = false;
            $('#line').hide();
            //document.getElementById('drop').volume = 1;
            //document.getElementById('click').volume = 1;
            //document.getElementById('bg').volume = 1;
        } else {
            this.mute = true;
            $('#line').show();
            //document.getElementById('drop').volume = 0;
            //document.getElementById('click').volume = 0;
            //document.getElementById('bg').volume = 0;
        }
    },

    getTimer: function() {
        let delta = Date.now() - this.startTime;
        let time = new Date(delta);
        let hours = time.getUTCHours();
        if (hours < 10) {
            hours = '0' + hours;
        }
        let minuts = time.getMinutes();
        if (minuts < 10) {
            minuts = '0' + minuts;
        }


        let sec = time.getSeconds();
        if (sec < 10) {
            sec = '0' + sec;
        }
        return minuts + ':' + sec;
    },

    startTimer: function() {
        if (this.timer) {
            this.stopTimer();
            $('#timer span').text('00:00');
        }
        this.startTime = Date.now();
        this.advShown = false;
        this.timer = setInterval(function() {

            $('#timer span').text(this.getTimer());
            if (!this.advShown && !this.hit && !this.rotation) {
                let delta = Date.now() - this.startTime;
                if (delta > 210000) {
                    /*Game.ysdk.adv.showFullscreenAdv({
                        callbacks: {}
                    });*/


                    console.log('3min adv show');
                    this.advShown = true;
                }
            }


        }.bind(this), 200);
    },

    stopTimer: function() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        //$('#timer span').text('00:00');
    },

    loaded: function() {
        this.loadingcount--;
        console.log(this.loadingcount);
        if (this.loadingcount <= 0) {
            $('#loader_bg').hide();
        }
    },

    onclick: function() {
        // document.getElementById('click').currentTime = 0;
        //document.getElementById('click').play();
    },

    fullScreen: function() {
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            var el = document.documentElement;
            if (el.requestFullScreen) {
                el.requestFullScreen(el);
            } else if (el.webkitRequestFullScreen) {
                //console.log('webkitfull');
                el.webkitRequestFullScreen(el.ALLOW_KEYBOARD_INPUT);
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen(el);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    },

    nextTurn: function() {
        this.curTurn += 1;
        if (this.curTurn > 2) {
            this.curTurn = 1;
        }
    },
    over: function(winer) {

        if (this.curMode === 0) {
            if (winer == 'player1') {
                $('#line1').text('Congratulations!');
                $('#line2').text('You win');
                $('#winner').show();
                $('#looser').hide();
                if (!this.mute) {
                    document.getElementById('ending').play();
                }
            } else {
                $('#line1').text('Robot wins');
                $('#line2').text('Try again!');
                $('#winner').hide();
                $('#looser').show();
            }
        } else {
            $('#winner').show();
            $('#looser').hide();
            if (winer == 'player1') {
                $('#line1').text('Player 1 wins');
            } else {
                $('#line1').text('Player 2 wins');
            }
            if (!this.mute) {
                document.getElementById('ending').play();
            }
            $('#line2').text('Try again!');
        }
        $('#gameTime').text(this.getTimer());
        //$('#gameEnd').fadeIn();
        setTimeout(function() {
            $('#gameEnd').fadeIn();
            Game.resize();
        }, 1000);
        this.controls = false;


    },
    isColTouche: function(touches) {
        if (touches.length <= 1) {
            return false;
        }
        for (let i in touches) {
            if (touches[i] > 11) {
                return false;
            }
        }
        return true;
    },
    resizeBallsGui: function() {
        let bheight = $('#ballsplace').height();
        $('#player1balls img, #player2balls img, #player1escBalls img, #player2escBalls img, #player1escBalls div, #player2escBalls div').css('width', bheight * 0.65 + 'px').css('height', bheight * 0.65 + 'px').css('border-radius', bheight * 0.65 / 2 + 'px');
    },
    updateBallsGui: function() {
        $('#player1balls, #player2balls, #player1escBalls, #player2escBalls').html('');
        //eightballgame.stripedDrop = [9, 10, 11, 12, 13, 14, 15];
        //eightballgame.solidDrop = [1, 2, 3, 4, 5, 6, 7];
        //console.log(eightballgame.sides.player1, eightballgame.solidDrop, eightballgame.stripedDrop)
        if (eightballgame.sides.player1 != '?') {
            let target1, target2, escTarget1, escTarget2;
            if (eightballgame.sides.player1 == 'solid') {
                target1 = '#player1balls';
                target2 = '#player2balls';
                escTarget1 = '#player1escBalls';
                escTarget2 = '#player2escBalls';

            } else {
                target1 = '#player2balls';
                target2 = '#player1balls';
                escTarget2 = '#player1escBalls';
                escTarget1 = '#player2escBalls';
            }
            for (let i in eightballgame.solidDrop) {
                let img = $('<img/>');
                $(img).attr('src', this.ballTextures[eightballgame.solidDrop[i]].image.toDataURL());
                $(target1).append(img);
                if (eightballgame.escSolid.indexOf(eightballgame.solidDrop[i]) != -1) {
                    let escImg = $('<img/>');
                    $(escImg).attr('src', 'img/redx.png');
                    $(escTarget1).append(escImg);

                } else {
                    $(escTarget1).append('<div/>');
                }
            }

            for (let i in eightballgame.stripedDrop) {
                let img = $('<img/>');
                $(img).attr('src', this.ballTextures[eightballgame.stripedDrop[i]].image.toDataURL());
                $(target2).append(img);
                if (eightballgame.escStriped.indexOf(eightballgame.stripedDrop[i]) != -1) {
                    let escImg = $('<img/>');
                    $(escImg).attr('src', 'img/redx.png');
                    $(escTarget2).append(escImg);

                } else {
                    $(escTarget2).append('<div/>');
                }
            }

        }
        this.resizeBallsGui();
    }


};

$(document).ready(function() {
    //Game.ysdk = new YaGames({});
    /*YaGames
        .init({
            adv: {
                onAdvClose: wasShown => {
                    console.info('adv closed!');
                }
            }
        })
        .then(y => {
            setTimeout(function() {
                y.adv.showFullscreenAdv({
                    callbacks: {}
                })
            }, 1000);
            Game.ysdk = y;


        });*/
    /*if (typeof gdsdk !== 'undefined' && gdsdk.showAd !== 'undefined') {
        gdsdk.showAd();

    }*/
    Game.init();
    setControls();
    $('#mode0').click(function() {
        insertVideoAd(30);
		showinterst("mode0");

        Game.resize();
        Game.setMode(0);
        Game.onclick();
    });



    $('#mode1').click(function() {
        insertVideoAd(30)
		showinterst("mode1");
        Game.resize();
        Game.setMode(1);
        Game.onclick();
    });
    $('#mainmenu').fadeIn();
    $('#sound').click(function() {
        Game.setMute();
    });

    $('#restart, #restart2').click(function() {
		console.log("restart");
		showreward("restart")
        if (eightballgame && eightballgame.hitInt) {
            clearInterval(eightballgame.hitInt);
        }
        Game.newgame();
        $('#gameEnd').fadeOut();
        Game.onclick();
        Game.controls = true;

    });

    $('#exit, #exit2').click(function() {
        
		showinterst("exit2");
        Game.controls = false;
        $('#mainmenu').fadeIn();
        $('#tryrus').show();
        $('#timer').fadeOut();
        $('#restart, #exit').fadeOut();
        $('#curTurn').fadeOut();
        $('#gameEnd').fadeOut();
        $('#howToPlay').show();
        Game.bot = null;
        clearInterval(eightballgame.hitInt);
        eightballgame = null;
        Game.onclick();
        $('#player1balls, #player2balls, #ballsplace ').hide();

    });


    $('#fullScreen').click(function() {
        Game.fullScreen();
    }).show();

    //if (device.mobile() || device.tablet()) {
    if (device.ios()) {
        Game.setMute();
        $('#sound').hide();
    }

    if (!config.fullscreen) {
        $('#fullScreen').hide();
    }




    //$('#mainmenu').hide();
});

//记录分数
function reportScore(a){console.log("funtouch：logScore");document.location = "magic://game?score="+a;}
//弹出插屏
function insertInterstitialAd(a){console.log("funtouch：insertInterstitial"+a);document.location = "magic://ad?type=interstitial&position=top&random="+a;}
//弹出video
function insertVideoAd(a){console.log("funtouch：insertVideo"+a);document.location = "magic://ad?type=video&position=top&random="+a;}
//弹出banner
function insertBannerAd(){console.log("funtouch：insertBanner");document.location = "magic://ad?type=banner&position=bottom";}	