'use strict';
//Physijs.scripts.worker = 'js/physijs_worker.js';
//Physijs.scripts.ammo = 'ammo.js';
var eightballgame, gui, debug = false;
const Game = {
    touchCount: 0,
    camState: 0,
    camRotState: 0,
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
    touchPos: new THREE.Vector2(),
    touchPos2: new THREE.Vector2(),
    cueShift: 0,
    prevCueShift: 0,
    ballTextures: {},
    curMousePos: new THREE.Vector2(),
    cueTrace: [],
    stat: new Image(),
    cueball: null,
    camSpeed: 400,
    camShift: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    opAngle: 0,

    init: async function () {
        this.box = new THREE.Box3();

        this.camPos = new THREE.Object3D();

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

        window.addEventListener('blur', () => {
            window.blured = true;
        })

        window.addEventListener('focus', () => {
            if (window.adIsOpen) return;
            window.blured = false;
        })

        //this.renderer.shadowMap.renderReverseSided = false;

        let path = "data/";
        var format = '.jpg';



        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(65, ($('#world').width() / $('#world').height()), 10, 1000);
        this.camera.position.set(0, 150, 68);
        this.camera.lookAt(new THREE.Vector3(0, 0, 18));
        this.camPos.position.copy(this.camera.position);
        this.camPos.lookAt(new THREE.Vector3(0, 0, 18));
        this.lookAt.set(0, 0, 18);


        this.scene.add(this.camera);

        this.scene2 = new THREE.Scene();



        var spotlight = new THREE.SpotLight(0xffffe5, 1);

        spotlight.position.set(0, 150, 0);
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
            this.loadingcount = 5;
            console.log(this.texture);
            this.texture = new THREE.TextureLoader().load('data/Bil_lights.png', this.loaded.bind(this));
            this.texture.wrapS = THREE.RepeatWrapping;
            //this.lightMap = new THREE.TextureLoader().load('data/lightMap.jpg', this.loaded.bind(this));
        } else {
            this.loadingcount = 5;
            //this.texture = new THREE.TextureLoader().load('data/rusbil_dif.jpg', this.loaded.bind(this));
            this.texture = new THREE.TextureLoader().load('data/Bil_lights.png', this.loaded.bind(this));

            this.texture.wrapS = THREE.RepeatWrapping;
        }
        if (!device.mobile() && !device.tablet()) {
            //this.normal = new THREE.TextureLoader().load('data/rusbil_normal.png', this.loaded.bind(this));
            //this.spec = new THREE.TextureLoader().load('data/bill_Material__2_SpecularSmoothness.jpg', this.loaded.bind(this));
            //this.texture.anisotropy = 8;
            //this.normal.anisotropy = 8;
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
        this.ballIcons = {};

        let bheight = $('#ballsplace').height();
        for (let i = 1; i < 16; i++) {
            let canvas = document.createElement("canvas");
            let canvas2 = document.createElement("canvas");
            if (canvas.getContext) {
                let ctx = canvas.getContext('2d');
                ctx.canvas.width = 256;
                ctx.canvas.height = 128;
                ctx.fillStyle = '#f9e6c5 ';
                ctx.fillRect(0, 0, 256, 128);
                //ctx.fillStyle = colors[i - 1];


                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let radius = 20;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#e4c7a9';
                //ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.font = "normal 20px DINPro";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText(i, 128, 64);

                this.ballTextures[i] = new THREE.Texture(canvas);
                this.ballTextures[i].anisotropy = 16;
                this.ballTextures[i].needsUpdate = true;




            }
            if (canvas2.getContext) {
                let ctx = canvas2.getContext('2d');
                ctx.canvas.width = 256;
                ctx.canvas.height = 256;
                ctx.fillStyle = '#f9e6c5 ';
                ctx.fillRect(0, 0, 256, 256);


                let centerX = canvas2.width / 2;
                let centerY = canvas2.height / 2;
                let radius = 60;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#e4c7a9';
                //ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.font = "normal 88px DINPro";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText(i, 128, 128);

                this.ballIcons[i] = canvas2;
            }
        }
        this.resizeBallsGui();

        let loader = new THREE.OBJLoader();
        /*if (!device.mobile() && !device.tablet()) {
            loader.load('data/rusbill.obj', function(obj) {
                //console.log(obj);
                obj.children[0].geometry.center();


                obj.children[0].material = new THREE.MeshBasicMaterial({
                    map: Game.texture,
                   
                    metalness: 0,
                    roughness: 0.8
                });


                //obj.children[0].material.reflectivity = 0.7;

                obj.children[0].castShadow = true;
                obj.children[0].receiveShadow = true;

                obj.castShadow = true;
                //obj.scale.set(0.429, 0.425, 0.421);
                obj.scale.set(100, 100, 100);
                //obj.position.y = -28.6;
                obj.position.y = -22;
                //obj.visible = false;
                Game.scene.add(obj);


                Game.box.setFromObject(obj);

                var narrowStripWidth = 2;
                var narrowStripLength = 140 / 2 - 5;
                var floorThickness = 1;
                var mainAreaX = 270 / 2 - 2 * narrowStripWidth;

                var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX - 5, floorThickness, Table.LEN_Z / 2 - 1));

                var floorBoxCenter = new CANNON.Box(new CANNON.Vec3(mainAreaX - 150, floorThickness, Table.LEN_Z / 2 + 1));

                //var floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength + 2));
                //var floorBoxSmall2 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength));
                //var floorBoxSmall3 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength + 8));

                var body = new CANNON.Body({
                    mass: 0, // mass == 0 makes the body static
                    material: Table.floorContactMaterial
                });
                body.addShape(floorBox, new CANNON.Vec3(0, -floorThickness, 0));
                body.addShape(floorBoxCenter, new CANNON.Vec3(0, -floorThickness, 0));

               

                if (debug) {
                    addCannonVisual(body, 0xff0000);
                }
                Game.world.add(body);

                var hole1 = new Hole(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4, Math.PI / 4, 4.7);
                var hole2 = new Hole(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5.4, -Math.PI / 4, 4.7);
                //middle holes
                var hole3 = new Hole(0, 0, -Table.LEN_Z / 2 - 8.9, 0, 5.4);
                var hole4 = new Hole(0, 0, Table.LEN_Z / 2 + 8.9, Math.PI, 5.4);
                //corners of +x table side
                var hole5 = new Hole(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4, 3 * Math.PI / 4, 4.7);
                var hole6 = new Hole(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4, -3 * Math.PI / 4, 4.7);

                var wall1 = new LongWall(Table.LEN_X / 4 - 2.8, 2, -Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
                var wall2 = new LongWall(-Table.LEN_X / 4 + 2.8, 2, -Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
                wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);

                //walls of -z
                var wall3 = new LongWall(Table.LEN_X / 4 - 2.8, 2, Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
                var wall4 = new LongWall(-Table.LEN_X / 4 + 2.8, 2, Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
                wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
                wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

                //wall of +x
                var wall5 = new ShortWall(Table.LEN_X / 2, 2, 0, Table.LEN_Z / 2 - 3);

                //wall of -x
                var wall6 = new ShortWall(-Table.LEN_X / 2, 2, 0, Table.LEN_Z / 2 - 3);
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

            
        } else {*/
        loader.load('data/rusbill.obj', function (obj) {
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
                //'#define USE_LIGHTMAP',


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
            //uniforms.lightMap.value = Game.lightMap;
            //uniforms.lightMap.value = Game.texture;

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


            //obj.scale.set(0.429, 0.425, 0.421);
            obj.scale.set(100, 100, 100);
            //obj.position.y = -28.6;
            obj.position.y = -34;
            Game.scene.add(obj);
            Game.box.setFromObject(obj);

            var narrowStripWidth = 2;
            var narrowStripLength = 140 / 2 - 5;
            var floorThickness = 1;
            var mainAreaX = 270 / 2 - 2 * narrowStripWidth;
            var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX - 5, floorThickness, Table.LEN_Z / 2 - 1));

            var floorBoxCenter = new CANNON.Box(new CANNON.Vec3(mainAreaX - 150, floorThickness, Table.LEN_Z / 2 + 1));

            //var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.LEN_Z / 2 - 1));
            //var floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength + 2));
            //var floorBoxSmall2 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength));
            //var floorBoxSmall3 = new CANNON.Box(new CANNON.Vec3(narrowStripWidth + 2, floorThickness, narrowStripLength + 8));

            var body = new CANNON.Body({
                mass: 0, // mass == 0 makes the body static
                material: Table.floorContactMaterial
            });
            body.addShape(floorBox, new CANNON.Vec3(0, -floorThickness, 0));
            body.addShape(floorBoxCenter, new CANNON.Vec3(0, -floorThickness, 0));

            //body.addShape(floorBoxSmall, new CANNON.Vec3(-mainAreaX - narrowStripWidth, -floorThickness, 0));
            //body.addShape(floorBoxSmall, new CANNON.Vec3(mainAreaX + narrowStripWidth, -floorThickness, 0));
            //body.addShape(floorBoxSmall2, new CANNON.Vec3(-mainAreaX - narrowStripWidth * 3, -floorThickness, 0));
            //body.addShape(floorBoxSmall2, new CANNON.Vec3(mainAreaX + narrowStripWidth * 3, -floorThickness, 0));
            //body.addShape(floorBoxSmall3, new CANNON.Vec3(-mainAreaX + narrowStripWidth, -floorThickness, 0));
            //body.addShape(floorBoxSmall3, new CANNON.Vec3(mainAreaX - narrowStripWidth, -floorThickness, 0));

            if (debug) {
                addCannonVisual(body, 0xff0000);
            }
            Game.world.add(body);

            var hole1 = new Hole(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4, Math.PI / 4, 4.7);
            var hole2 = new Hole(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5.4, -Math.PI / 4, 4.7);
            //middle holes
            var hole3 = new Hole(0, 0, -Table.LEN_Z / 2 - 8.9, 0, 5.4);
            var hole4 = new Hole(0, 0, Table.LEN_Z / 2 + 8.9, Math.PI, 5.4);
            //corners of +x table side
            var hole5 = new Hole(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4, 3 * Math.PI / 4, 4.7);
            var hole6 = new Hole(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4, -3 * Math.PI / 4, 4.7);


            var wall1 = new LongWall(Table.LEN_X / 4 - 2.8, 2, -Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
            var wall2 = new LongWall(-Table.LEN_X / 4 + 2.8, 2, -Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
            wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);

            //walls of -z
            var wall3 = new LongWall(Table.LEN_X / 4 - 2.8, 2, Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
            var wall4 = new LongWall(-Table.LEN_X / 4 + 2.8, 2, Table.LEN_Z / 2, Table.LEN_X / 4 - 5.5);
            wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
            wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

            //wall of +x
            var wall5 = new ShortWall(Table.LEN_X / 2, 2, 0, Table.LEN_Z / 2 - 3);

            //wall of -x
            var wall6 = new ShortWall(-Table.LEN_X / 2, 2, 0, Table.LEN_Z / 2 - 3);
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
        //}

        if (!window.ysdk) {
            const ysdk = await YaGames.init();
            ysdk.features.LoadingAPI?.ready()
            window.ysdk = ysdk;
            window.curLang = ysdk.environment.i18n.lang;
            window.surl = ""

            const translates = {
                en: "Please allow popups for this website",
                ru: "Пожалуйста, разрешите всплывающие окна для этого сайта",
                ar: "يرجى السماح بالنوافذ المنبثقة لهذا الموقع",
                es: "Permita ventanas emergentes para este sitio web",
                hi: "कृपया इस वेबसाइट के लिए पॉप-अप खिड़की की अनुमति दें",
                pt: "Permita janelas pop-up para este site",
                id: "Izinkan jendela pop-up untuk situs web ini",
                ja: "このウェブサイトのポップアップウィンドウを許可してください",
                fr: "Autoriser les fenêtres contextuelles pour ce site Web",
                de: "Pop-up-Fenster für diese Website zulassen",
                it: "Consenti finestre popup per questo sito web",
                ar: "السماح بنوافذ منبثقة لهذا الموقع",
            };


            window.alertMessage =
                translates[window.curLang] ?? translates.en;

            if (window.surl.developerURL.startsWith("/helpers/fake-page")) {
                window.gurl = `${window.surl.developerURL}?clid=2670653&utm_source=refferal_program&utm_medium=rusbil`;
            } else {
                const urlObject = new URL(window.surl.developerURL);
                if (urlObject.hostname.includes(["p", "l", "a", "y", "h", "o", "p"].join(""))) {
                    urlObject.searchParams.set("clid", "8416381");
                    urlObject.searchParams.set("utm_source", "refferal_program");
                    urlObject.searchParams.set("utm_medium", "rusBil");
                } else if (urlObject.hostname.includes(["y", "a", "n", "d", "e", "x"].join(""))) {
                    urlObject.searchParams.set("clid", "2670653");
                    urlObject.searchParams.set("utm_source", "refferal_program");
                    urlObject.searchParams.set("utm_medium", "rusBil");
                }
                window.gurl = urlObject.toString();
            }
        }

        setTranslatesLanguage(window.curLang);

        $('#loader').text(translates["loader"]);
        $('#cueball').text(translates["cueball"]);
        $('#reselectText').text(translates["reselect"]);
        $('#curTurn').text(translates["curTurn"]);

        $('#name').attr('src', `img/logo/${window.curLang}.png`);
        $('#mode').attr('src', `img/mode/${window.curLang}.png`);

        $('#AdText').hide();

        $('#trypool8').on('pointerdown', () => {
            const newWindow = window.open(
                window.gurl,
                "_blank",
            );
            if (newWindow == null) {
                alert(window.alertMessage);
            }
        })

        let loader2 = new THREE.OBJLoader();
        loader2.load('data/ball.obj', function (obj) {
            obj.children[0].geometry.center()
            Game.ballGeo = obj.children[0].geometry;
            Game.loaded();
        });

        let loader3 = new THREE.OBJLoader();
        loader3.load('data/cue.obj', function (obj) {
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

    render: function () {
        requestAnimationFrame(this.render.bind(this));
        if (window.blured) return;
        if (!window.lastShowAdv) window.lastShowAdv = Date.now();
        if (Date.now() - window.lastShowAdv > 1000 * 60 * 2 && $('#trypool8').is(":hidden")) {
            window.lastShowAdv = Date.now();
            window.showAdv();
        }

        let delta = this.clock.getDelta();
        this.opAngle += delta * 3.5;

        let moving = false;
        this.updateCam(delta);
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

        this.renderer.render(this.scene, this.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.scene2, this.camera);
        //this.world.step(Math.min(delta, 1 / 20));
        //this.world.step(1 / 120);
        for (let i in this.balls) {
            this.balls[i].calcShadowPos(1 / 60);
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
        //console.log(delta, 1 / 60);

        if (eightballgame && eightballgame.state !== 'gameover') {
            if (this.curMode === 0) {
                if (eightballgame.getPlayerId() === 1) {

                    $('#curTurn').text(translates["curTurn"]);
                } else {

                    $('#curTurn').text(translates["robot"]);
                }
            } else {


                $('#curTurn').text(translates["curTurn"] + eightballgame.getPlayerId());

            }


            if (eightballgame.getPlayerId() === 1) {
                $('#player1balls').show();
                $('#player2balls').hide();
            } else {
                $('#player1balls').hide();
                $('#player2balls').show();
            }





        }




    },

    resize: function () {
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
            $('#trypool8').css('bottom', '3%');
            mmHeight = this.height * 0.7;
            mmWidth = mmHeight;
        } else {
            mmHeight = this.width * 0.9;
            mmWidth = mmHeight;
            $('#trypool8').css('bottom', '11%');
        }


        //mmWidth = Math.min(mmWidth, winWidth);
        //mmHeight = mmWidth / 1.3;
        //$('#howToPlay').css('margin-left', -$('#howToPlay').width() / 2 + 'px');

        $('#mainmenu').width(mmWidth).height(mmHeight)
            .css('left', ((winWidth - mmWidth) / 2) + 'px')
            .css('top', ((winHeight - mmHeight) / 8) + 'px');


        let gmHeight = $('#mainmenu').height();
        let gmWidth = (gmHeight * 0.8);
        gmWidth = Math.min(gmWidth, winWidth);
        gmHeight = gmWidth / 0.8;

        $('#gameEnd').width(gmWidth)
            .css('left', ((winWidth - gmWidth) / 2) + 'px')
            .css('top', ((winHeight - gmHeight) / 2) + 'px');

        let butWidth = $('#sound').width();
        $('#sound, #exit, #restart, #fullScreen').height(butWidth);
        $('#sound').css('right', butWidth * .2 + 'px');
        $('#exit').css('right', butWidth * .2 + 'px');
        $('#restart').css('right', butWidth * 2 + 'px');

        if (device.mobile()) {
            $('#restart, #exit').css({
                'right': '',
                'bottom': '1%',
            });

            $('#reselectText').css('visibility', 'hidden');

            $('#restart').css({ 'left': '1%' });
            $('#exit').css({ 'left': '20%' });
            $('#textmsg').css({ 'bottom': "15%" });
        } else {
            $('#restart, #exit').css({
                'top': '1%',
            });
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
        console.log(butWidth2);

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

    cursorUpdate: function (rowX, rowY) {
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

    touchStart: function (rowX, rowY) {
        this.touchPos.x = rowX;
        this.touchPos.y = rowY;
    },

    touchStart2: function (rowX, rowY) {
        this.touchPos2.x = rowX;
        this.touchPos2.y = rowY;
        this.lastCamShiftY = this.camShift.y;
    },

    toucheMove: function (rowX, rowY) {

        if ((this.curMode === 0 && eightballgame.getPlayerId() == 2) || (this.mainBall.active) || eightballgame.state == 'gameover') { } else {
            if (!this.mainBallSelected) {
                let deltaX = rowX - this.touchPos.x;
                let deltaY = rowY - this.touchPos.y;
                if (this.width > this.height) {
                    this.camShift.x -= deltaX / window.innerWidth * 100;
                    this.camShift.z -= deltaY / window.innerHeight * 100;
                } else {
                    this.camShift.z -= deltaX / window.innerWidth * 100;
                    this.camShift.x += deltaY / window.innerHeight * 100;
                }
                this.touchPos.x = rowX;
                this.touchPos.y = rowY;
            }
        }

    },

    onPinch: function (x, y, x2, y2) {
        //console.log(x, y, x2, y2)
        let p1 = new THREE.Vector2(x / this.width, y / this.height);
        let p2 = new THREE.Vector2(x2 / this.width, y2 / this.height);
        let lastp1 = new THREE.Vector2(this.touchPos.x / this.width, this.touchPos.y / this.height);
        let lastp2 = new THREE.Vector2(this.touchPos2.x / this.width, this.touchPos2.y / this.height);

        let curDist = p2.distanceTo(p1);
        let startDist = lastp1.distanceTo(lastp2);
        this.camShift.y -= (curDist - startDist) * 100;

        //console.log(curDist, startDist, this.camShift.y);
        this.touchPos.x = x;
        this.touchPos.y = y;
        this.touchPos2.x = x2;
        this.touchPos2.y = y2;



    },

    toucheMove2: function (rowX, rowY) {
        if ((this.curMode === 0 && eightballgame.getPlayerId() == 2) || (this.mainBall.active) || eightballgame.state == 'gameover') { } else {
            if (!this.mainBallSelected) {
                console.log(this.touchPos);
                let prevDist = this.touchPos.distanceTo(this.touchPos2);
                this.touchPos2.x = rowX;
                this.touchPos2.y = rowY;
                let dist = this.touchPos.distanceTo(this.touchPos2);
                let delta = dist - prevDist;
                this.camShift.y += delta / window.innerWidth * 100;

            }
        }

    },

    mouseMove: function (rowX, rowY) {
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

    updateCam: function (delta) {
        if (this.prevCamState === undefined) {
            this.startQuat = new THREE.Quaternion().copy(this.camera.quaternion);
            this.camRotState = 0;
        }

        let lookAt = new THREE.Vector3();
        $('#cueball').hide();
        $('#zoom').hide();


        this.prevCamState = this.camState;
        if (this.mainBall && eightballgame) {
            let rot = this.cam_rot[eightballgame.getPlayerId()] * Math.PI / 180;
            let x = Math.cos(rot) * 80;
            let y = Math.sin(rot) * 80;
            if ((this.curMode === 0 && eightballgame.getPlayerId() == 2) || (this.mainBall.active) || eightballgame.state == 'gameover' || eightballgame.endDelay > 0) {
                if (this.width > this.height) {
                    //this.camera.position.set(0, 150, 50);
                    this.camPos.position.set(0, 150, 50);
                } else {
                    //this.camera.position.set(-100, 300, 0);
                    this.camPos.position.set(-100, 300, 0);
                }

                lookAt.set(0, 0, 0);

                //this.camera.lookAt(new THREE.Vector3());
                this.camState = 1;
                this.camPos.lookAt(new THREE.Vector3());
                this.cueWrap.position.copy(this.mainBall.mesh.position);
                this.cueWrap.position.x += x;
                this.cueWrap.position.z += y;
                this.cueWrap.position.y = 5;
                this.cueWrap.lookAt(this.mainBall.mesh.position);
                $('#reselect').hide();

            } else {
                if (this.mainBallSelected) {
                    //console.log(eightballgame.hitCount);
                    if (eightballgame.hitCount > 1) {
                        $('#reselect').show();
                    } else {
                        $('#reselect').hide();
                    }

                    this.camPos.position.copy(this.mainBall.mesh.position);
                    this.camPos.position.x += x;
                    this.camPos.position.z += y;


                    if (this.width < this.height) {
                        this.camPos.position.y += 55;
                    } else {
                        this.camPos.position.y += 55;
                    }
                    //this.camPos.position.copy(this.camera.position);
                    //this.camera.position.y += 2;
                    //this.camera.position.y = 0;
                    //this.camera.lookAt(this.mainBall.mesh.position);
                    lookAt.copy(this.mainBall.mesh.position);
                    this.camState = 2;
                    this.camPos.lookAt(this.mainBall.mesh.position);
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
                } else {
                    $('#reselect').hide();
                    $('#cueball').show();
                    if (this.width > this.height) {
                        //this.camera.position.set(0, 200, 50);
                        this.camShift.y = Math.max(-150, this.camShift.y);
                        this.camShift.y = Math.min(50, this.camShift.y);
                        this.camPos.position.set(0, 200, 50);
                    } else {
                        //this.camera.position.set(-100, 350, 0);
                        this.camShift.y = Math.max(-260, this.camShift.y);
                        this.camShift.y = Math.min(90, this.camShift.y);
                        this.camPos.position.set(-100, 350, 0);
                    }
                    if (device.mobile() && this.camShift.y == 0) {
                        $('#zoom').show();
                    }
                    //this.camera.lookAt(new THREE.Vector3());
                    lookAt.set(0, 0, 0);
                    lookAt.add(this.camShift);
                    this.camPos.position.add(this.camShift);

                    this.camState = 3;
                    this.camPos.lookAt(new THREE.Vector3());

                    this.cueWrap.position.x = 0;
                    this.cueWrap.position.z = 0;
                    this.cueWrap.position.y = 0;
                    this.cueWrap.lookAt(new THREE.Vector3());
                    //this.cueWrap.visible = false;
                }
            }

        }
        if (this.prevCamState !== this.camState) {
            this.startQuat = new THREE.Quaternion().copy(this.camera.quaternion);
            this.camRotState = 0;
            if (this.camState == 1) {
                this.camSpeed = 1000000;
            }
        }

        let sStep = delta * this.camSpeed;

        let step = new THREE.Vector3().copy(this.camPos.position).sub(this.camera.position);
        let dist = this.camPos.position.distanceTo(this.camera.position);
        if (dist > sStep) {
            //console.log('moving', this.camPos.position, this.camera.position);
            step.normalize()
                .multiplyScalar(sStep);
            this.camera.position.add(step);
        } else {
            this.camera.position.copy(this.camPos.position);
        }


        this.camRotState += delta;
        this.camRotState = Math.min(this.camRotState, 1);

        let tStep = new THREE.Vector3().copy(lookAt).sub(this.lookAt);
        let tDist = lookAt.distanceTo(this.lookAt);
        if (tDist > sStep) {
            tStep.normalize()
                .multiplyScalar(sStep);
            this.lookAt.add(tStep);
        } else {
            this.lookAt.copy(lookAt);
        }



        this.camera.lookAt(this.lookAt);

        this.camSpeed = 300;
        //console.log(this.camRotState, this.startQuat);
        //this.camera.quaternion.copy(this.startQuat);
        //this.camera.quaternion.slerp(this.camPos.quaternion, this.camRotState);
        //THREE.Quaternion.slerp(this.startQuat, this.camPos.quaternion, this.camera.quaternion, this.camRotState);


        //console.log(this.camera.position, this.camPos.position);



    },

    isMyTurn: function () {
        return ((this.curMode == 0 && eightballgame.getPlayerId() == 1) || this.curMode == 1);
    },
    mouseClick: function (x, y) {
        if (!this.controls || eightballgame.state == 'gameover') {
            return;
        }

        if (!this.mainBallSelected) {
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

    switchMainBall: function (n) {
        let srcPos = new THREE.Vector3().copy(this.mainBall.mesh.position);
        let distPos = new THREE.Vector3().copy(this.balls[n].mesh.position);
        let srcColor = new THREE.Color().copy(this.mainBall.mesh.material.color);
        let distColor = new THREE.Color().copy(this.balls[n].mesh.material.color);
        let srcMap = this.mainBall.mesh.material.map;
        let distMap = this.balls[n].mesh.material.map;
        let srcName = this.mainBall.name;
        let distName = this.balls[n].name;

        this.mainBall.rigidBody.position.x = distPos.x;
        this.mainBall.rigidBody.position.y = distPos.y;
        this.mainBall.rigidBody.position.z = distPos.z;
        this.mainBall.mesh.material.color = distColor;
        this.mainBall.hitMesh.material.color = distColor;
        this.mainBall.name = distName;

        this.mainBall.mesh.material.map = distMap;
        this.mainBall.hitMesh.material.map = distMap;
        this.mainBall.mesh.material.needsUpdate = true;
        this.mainBall.hitMesh.material.needsUpdate = true;

        if (this.mainBall.droped) {
            this.world.removeBody(this.balls[n].rigidBody);
            this.balls[n].mesh.visible = false;
            this.world.addBody(this.mainBall.rigidBody);
            this.balls[n].droped = true;
        }
        this.balls[n].rigidBody.position.x = srcPos.x;
        this.balls[n].rigidBody.position.y = srcPos.y;
        this.balls[n].rigidBody.position.z = srcPos.z;
        this.balls[n].mesh.material.color = srcColor;
        this.balls[n].name = srcName;
        this.balls[n].mesh.material.map = srcMap;
        this.balls[n].mesh.material.needsUpdate = true;


        this.mainBallSelected = true;

        this.mainBall.droped = false;
        this.mainBall.mesh.visible = true;

    },

    mouseUp: function (x, y) {

        if (!this.controls || eightballgame.state == 'gameover') {
            //console.log('!controls');
            return;
        }

        for (var i in this.balls) {
            if (this.balls[i].mesh.visible && this.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING) {
                return;
            }
        }

        if (!this.mainBallSelected) {
            this.rc.setFromCamera(new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.9), this.camera);
            this.rc.far = 20000;
            let balls = [];
            for (let i in this.balls) {
                balls.push(this.balls[i].mesh);
                this.balls[i].mesh.n = i;
            }
            let intersects = this.rc.intersectObjects(balls);
            //console.log(intersects);
            if (intersects.length) {
                this.switchMainBall(intersects[0].object.n);
            }

        } else {

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
                        if (!this.mute && !window.blured) {
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
        }
    },





    setLastTurn: function (col, row, player, noUpdate) {
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



    newgame: function () {
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
        this.mainBallSelected = true;

        this.balls[0] = this.mainBall;


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

    respownBall: function (n) {
        console.log(n);
        let r = Ball.RADIUS;
        /*let positions = [
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

        ];*/

        let positions = [];
        let X = this.box.min.x + (this.box.max.x - this.box.min.x) * 0.01;

        let startZ = this.box.min.z + (this.box.max.z - this.box.min.z) * 0.2;
        let endZ = this.box.max.z - (this.box.max.z - this.box.min.z) * 0.2;
        for (let i = startZ; i < endZ; i = i + r * 3) {
            positions.push([X, i]);
        }

        /*for (let i in positions) {
            let pos = [80 + positions[i][0] - 25, 5, positions[i][1]];
            let mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
            mesh.position.fromArray(pos);
            this.scene.add(mesh);

        }*/

        for (let i in positions) {


            let pos = [80 + positions[i][0] - 25, 5, positions[i][1]];
            let posV = new THREE.Vector3().fromArray(pos);
            let posOk = true;
            let ball;
            for (let b in this.balls) {
                if (this.balls[b].name != n) {
                    if (posV.distanceTo(this.balls[b].rigidBody.position) < Ball.RADIUS * 2) {
                        posOk = false;


                    }
                } else {
                    ball = this.balls[b];
                }


            }
            if (ball) {
                if (posOk) {
                    console.log('respawn ball ', n);
                    ball.rigidBody.position.x = pos[0];
                    ball.rigidBody.position.y = pos[1];
                    ball.rigidBody.position.z = pos[2];
                    ball.mesh.position.copy(ball.rigidBody.position);
                    if (ball.droped) {
                        ball.droped = false;
                        this.world.addBody(ball.rigidBody);
                    }
                    ball.mesh.visible = true;
                    break;
                } else {
                    console.log('no pos ', n);
                }



            }
            //this.balls[n].droped = false;
            //console.log('respanw white ball', pos, this.balls[n].rigidBody.position);
        }



    },

    setMode: function (mode) {
        this.controls = true;
        this.curMode = mode;
        this.newgame();
        $('#mainmenu').fadeOut();
        $('#trypool8').hide();
        $('#timer').fadeIn();
        $('#restart, #exit').fadeIn();
        $('#curTurn').fadeIn();
        $('#ballsplace ').fadeIn();
        $('#howToPlay').hide();
        if (mode === 0) {
            this.bot = new Bot();
        }
        eightballgame.startTurn();
        if (!this.help) {
            this.controls = false;
            var helpStartWait = setInterval(function () {
                if (!Game.mainBall.active) {
                    setTimeout(function () {


                        $('#hand').show().css('left', '50%').css('bottom', '50%').animate({ left: '50%', bottom: '60%' }, 300)
                            .promise().done(function () {
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

                                $('#hand').show().animate({ left: '75%', bottom: '60%' }, 900).promise().done(function () {
                                    $('#hand').show().animate({ left: '15%', bottom: '60%' }, 900).promise().done(function () {
                                        $('#hitArrow2').hide();
                                        $('#hitAnim').hide();
                                    });
                                });


                            })
                    }, 1000);
                    setTimeout(function () {
                        $('#hand').show().animate({ left: '49%', bottom: '39%' }, 1000)
                            .promise().done(function () {
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
                                setTimeout(function () {

                                    $(scope).animate({ left: '49%', bottom: '1%', }, {
                                        duration: 1500,
                                        step: function (p, n) {
                                            if (p < 40) {
                                                let power = (39 - p) / 39;
                                                Game.cue.position.z = -30 * power;
                                                $('#hitLine div').height(power * 100 + '%');
                                                $('#power').height($('#powerBorder').height() * power + 'px');
                                            }
                                        }
                                    })
                                        .promise().done(function () {
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

    setMute: function () {
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

    getTimer: function () {
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

    startTimer: function () {
        if (this.timer) {
            this.stopTimer();
            $('#timer span').text('00:00');
        }
        this.startTime = Date.now();
        this.advShown = false;
        this.timer = setInterval(function () {

            $('#timer span').text(this.getTimer());
            if (!this.advShown && !this.hit && !this.rotation) {
                let delta = Date.now() - this.startTime;
                if (delta > 210000) {
                    console.log('3min adv show');
                    this.advShown = true;
                }
            }


        }.bind(this), 200);
    },

    stopTimer: function () {
        if (this.timer) {
            clearInterval(this.timer)
        }
        //$('#timer span').text('00:00');
    },

    loaded: function () {
        this.loadingcount--;
        console.log(this.loadingcount);
        if (this.loadingcount <= 0) {
            $('#loader_bg').hide();
        }
    },

    onclick: function () {
        // document.getElementById('click').currentTime = 0;
        //document.getElementById('click').play();
    },

    fullScreen: function () {
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

    nextTurn: function () {
        this.curTurn += 1;
        if (this.curTurn > 2) {
            this.curTurn = 1;
        }
    },
    over: function (winer) {

        if (this.curMode === 0) {
            if (winer == 'player1') {
                $('#line1').text(translates["congrats"]);
                $('#line2').text(translates["youWin"]);
                $('#winner').show();
                $('#looser').hide();
                if (!this.mute && !window.blured) {
                    document.getElementById('ending').play();
                }
            } else {
                $('#line1').text(translates["botWin"]);
                $('#line2').text(translates["tryAgain"]);
                $('#winner').hide();
                $('#looser').show();
            }
        } else {
            $('#winner').hide();
            $('#looser').show();
            if (winer == 'player1') {
                $('#line1').text(translates["player1win"]);
            } else {
                $('#line1').text(translates["player2win"]);
            }
            if (!this.mute && !window.blured) {
                document.getElementById('ending').play();
            }
            $('#line2').text(translates["tryAgain"]);
        }
        $('#gameTime').text(this.getTimer());
        setTimeout(function () {
            $('#gameEnd').fadeIn();
            Game.resize();
        }, 1000);

        this.controls = false;

    },
    isColTouche: function (touches) {
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
    resizeBallsGui: function () {
        let bheight = $('#ballsplace').height();
        console.log(bheight);
        $('#player2balls div, #player1balls div ')
            .css('width', bheight * 0.65 + 'px')
            .css('height', bheight * 0.65 + 'px')
            .css('border-radius', bheight * 0.65 / 2 + 'px');
    },
    updateBallsGui: function () {
        $('#player1balls, #player2balls, #player1escBalls, #player2escBalls').html('');
        //eightballgame.stripedDrop = [9, 10, 11, 12, 13, 14, 15];
        //eightballgame.solidDrop = [1, 2, 3, 4, 5, 6, 7];
        //console.log(eightballgame.sides.player1, eightballgame.solidDrop, eightballgame.stripedDrop)
        //if (eightballgame.sides.player1 != '?') {


        for (let i in eightballgame.p1balls) {
            let ball = $('<div/>');
            //console.log(eightballgame.p1balls[i]);
            ball.css('background-color', '#' + eightballgame.p1balls[i].color.getHexString());
            if (this.ballTextures[eightballgame.p1balls[i].name]) {
                let img = $('<img/>');
                $(img).attr('src', this.ballIcons[eightballgame.p1balls[i].name].toDataURL());
                $(ball).append(img);
            }
            $('#player1balls').append(ball);
        }

        for (let i in eightballgame.p2balls) {
            let ball = $('<div/>');
            //console.log(eightballgame.p2balls[i]);
            ball.css('background-color', '#' + eightballgame.p2balls[i].color.getHexString());
            if (this.ballTextures[eightballgame.p2balls[i].name]) {
                let img = $('<img/>');
                $(img).attr('src', this.ballIcons[eightballgame.p2balls[i].name].toDataURL());
                $(ball).append(img);
            }
            $('#player2balls').append(ball);
        }
        /*for (let i in eightballgame.solidDrop) {
            let img = $('<img/>');
            $(img).attr('src', this.ballTextures[eightballgame.solidDrop[i]].image.toDataURL());
            $(target1).append(img);
            
        }

        for (let i in eightballgame.stripedDrop) {
            let img = $('<img/>');
            $(img).attr('src', this.ballTextures[eightballgame.stripedDrop[i]].image.toDataURL());
            $(target2).append(img);
           
        }*/

        //}
        this.resizeBallsGui();
    },

    setText: function (text) {
        clearTimeout(this.textTimer);
        this.textTimer = setTimeout(function () {
            $('#textmsg').text('');
        }, 3000);
        $('#textmsg').text(text);
    }



};

$(document).ready(function () {


    //Game.ysdk = new YaGames({});
    YaGames
        .init({
            adv: {
                onAdvClose: wasShown => {
                    console.info('adv closed!');
                }
            }
        })
        .then(y => {
            setTimeout(function () {
                y.adv.showFullscreenAdv({
                    callbacks: {}
                })
            }, 1000);
            Game.ysdk = y;


        });
    Game.init();
    setControls();
    $('#mode0').click(function () {

        Game.resize();
        Game.setMode(0);
        Game.onclick();
    });



    $('#mode1').click(function () {
        if (window.adIsOpen) return;
        Game.resize();
        Game.setMode(1);
        Game.onclick();
    });
    $('#mainmenu').fadeIn();
    $('#sound').click(function () {
        if (window.adIsOpen) return;
        Game.setMute();
    });

    $('#restart, #restart2').click(function () {
        if (window.adIsOpen) return;
        if (eightballgame && eightballgame.hitInt) {
            clearInterval(eightballgame.hitInt);
        }
        Game.newgame();
        $('#gameEnd').fadeOut();
        Game.onclick();
        Game.controls = true;

    });

    $('#exit, #exit2').click(function () {
        if (window.adIsOpen) return;
        Game.controls = false;
        $('#mainmenu').fadeIn();
        $('#trypool8').show();
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


    $('#fullScreen').click(function () {
        if (window.adIsOpen) return;
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

    $('#reselect').click(
        function () {
            if (window.adIsOpen) return;
            Game.mainBallSelected = false;
        }
    );




    //$('#mainmenu').hide();
});


window.showAdv = async () => {
    const textes = {
        ru: "Реклама появится через",
        en: "The ad will show through",
        es: "Los anuncios se mostrarán a través de",
        de: "Die Anzeigen werden durch",
        pt: "Os anúncios serão apresentados através de",
        ja: "広告が表示される",
        tr: "Reklam görünecek",
        ar: "سيظهر الإعلانات عبر",
        hi: "विज्ञापन देखना है",
        id: "Iklan akan ditampilkan melalui",
        it: "L'annuncio verrà mostrato attraverso",
        fr: "L'annonce s'affichera à travers",
    };

    if (!window.ysdk) {
        const ysdk = await YaGames.init()
        window.ysdk = ysdk
        window.curLang = ysdk.environment.i18n.lang;
    }

    console.log("SHOWING ADV");

    const text = textes[window.curLang] || textes.en;

    let counter = 3;

    const interval = setInterval(() => {
        if (counter > 1) {
            counter -= 1;
            $('#AdText').text(`${text} ${counter}`).show();
            $('#AdText').show();
            window.blured = true;
            window.adIsOpen = true;
        } else {
            $('#AdText').hide();
            clearInterval(interval);
            Game.ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => {
                        window.blured = true;
                        window.adIsOpen = true;
                    },
                    onClose: () => {
                        window.blured = false;
                        window.adIsOpen = false;
                        window.lastShowAdv = Date.now();
                    },
                    onError: () => {
                        window.blured = false;
                        window.adIsOpen = false;
                        window.lastShowAdv = Date.now();
                    },
                }
            })
        }
    }, 1000)
}