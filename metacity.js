import * as THREE from 'three';
import {OrbitControls} from 'OrbitControls';
import {RectAreaLightUniformsLib} from  'RectAreaLightUniformsLib';
import {RectAreaLightHelper} from 'RectAreaLightHelper';
import { GLTFLoader } from 'GltfLoader';
import Stats from "./examples/jsm/libs/stats.module.js";
import { RGBELoader } from 'RGBELoader';

import {Octree} from "./examples/jsm/math/Octree.js" // 3차원 공간을 분할 하고 빠르게 충돌검사.
import {Capsule} from "./examples/jsm/math/Capsule.js"

import { GUI } from './examples/jsm/libs/lil-gui.module.min.js';

/**
 * BLOOM 효과를 위해 추가
 */
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * 동영상 재생용으로 추가.
 */
import { CSS3DRenderer, CSS3DObject } from './examples/jsm/renderers/CSS3DRenderer.js'; 

/**
 * 가상 조이스틱
 */
import {joystick1} from './lib/JoystickController.js';
//import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const params = {
    exposure: 1.05,
    bloomStrength: 0.5,
    bloomThreshold: 0.05,
    bloomRadius: 0
};



class App{
    constructor(){
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({alpha: true,antialias:true});
        //renderer.physicallyCorrectLights = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        divContainer.appendChild(renderer.domElement);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        //renderer.physicallyCorrectLights = true;

        this._renderer = renderer;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xbfe3dd );
        this._scene = scene;

        

        this._setupOctree();
        this._setupCamera();
        this._setupLight();
        // this._setupRectAreaLight();
         this._loadingModel();
        this._setupModel();
        this._setupControls();


        

       
        //this.onYouTubeIframeAPIReady();
        // this._onkeydown();

        // const renderPass = new RenderPass( this._scene, this._camera );
        
        // const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		// 		bloomPass.threshold = params.bloomThreshold;
		// 		bloomPass.strength = params.bloomStrength;
		// 		bloomPass.radius = params.bloomRadius;

		// 		this._composer = new EffectComposer( this._renderer );
		// 		this._composer.addPass( renderPass );
		// 		this._composer.addPass( bloomPass );

                /*
                const gui = new GUI();

        gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

            renderer.toneMappingExposure = Math.pow( value, 4.0 );

        } );

        gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

            bloomPass.threshold = Number( value );

        } );

        gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

            bloomPass.strength = Number( value );

        } );

        gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

            bloomPass.radius = Number( value );

        } ); */

        // this._init();        
        window.onresize = this.resize.bind(this); // 창크기가 변경될때 마다 속성값 재정의 때문에 ( App 클래스가 변경될때 )
        this.resize(); // 생성자에서 무조건 한번 호출

        

        requestAnimationFrame(this.render.bind(this)); // 렌더메서드를 호출. 
        
        
    }

    _setupOctree(){
        this._worldOctree = new Octree();
    }

    /**
     * 유튜브 로딩을 위한 함수들.
     */

     

     _loadYouTubeApi() {

        console.log("loadYouTubeApi");     
     
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      _createYoutubeVideo() {


        console.log("_createYoutubeVideo");
        this._cssscene = new THREE.Scene();
        this._cssrenderer = new CSS3DRenderer();
        this._cssrenderer.setSize(window.innerWidth, window.innerHeight);
        //this._divContainer.appendChild(this._cssrenderer.domElement);
        document.querySelector('#css').appendChild(this._cssrenderer.domElement);
     
        var videodiv = document.createElement('div');
        videodiv.style.width = '480px';
        videodiv.style.height = '360px';
        videodiv.style.backgroundColor = 'pink';
        videodiv.setAttribute("id", "videoframe");
     
        var cssobject = new CSS3DObject(videodiv);
        cssobject.position.set(0, 0, 0);
        cssobject.rotation.y = 0;
        cssobject.scale.set(1,1, 1);
     
        this._cssscene.add(cssobject);
     
        var occlusionMaterial = new THREE.MeshPhongMaterial({
          opacity: 0.0,
          color: new THREE.Color('black'),
          blending: THREE.NoBlending,
          side: THREE.DoubleSide,
        });
     
        var webglrepresentation = new THREE.Mesh(new THREE.PlaneGeometry(480, 360), occlusionMaterial);
        webglrepresentation.position.copy(cssobject.position);
        webglrepresentation.rotation.copy(cssobject.rotation);
        webglrepresentation.scale.copy(cssobject.scale);
        this._scene.add(webglrepresentation);
      }

      
      
     
      _init() {
        // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
        // camera.position.z = 10;
     
        // scene = new THREE.Scene();
     
        // renderer = new THREE.WebGLRenderer({
        //   alpha: true,
        //   antialias: true
        // });
        // renderer.setClearColor(0x000000, 0);
        // renderer.setSize(window.innerWidth, window.innerHeight);
        // document.querySelector('#webgl').appendChild(renderer.domElement);
     
        // var boxgeometry = new THREE.BoxGeometry(1, 1, 1);
        // var normalmaterial = new THREE.MeshNormalMaterial();
     
        // mesh = new THREE.Mesh(boxgeometry, normalmaterial);
        // scene.add(mesh);
     
        this._createYoutubeVideo();
     
        // var backPlaneGeometry = new THREE.PlaneGeometry(20, 10)
        // var backPlane = new THREE.Mesh(backPlaneGeometry, normalmaterial);
        // backPlane.position.set(0,0,-10);
        // scene.add(backPlane);
     
        // controls = new THREE.OrbitControls(camera, renderer.domElement);
     
     
        // window.addEventListener('resize', onWindowResize, false);
        this._loadYouTubeApi();
      }
     
    //   _animate() {
     
    //     requestAnimationFrame(animate);
    //     controls.update();
    //     renderer.render(scene, camera);
    //     cssrenderer.render(cssscene, camera); //BOOM
    //   }
     
    //   _onWindowResize() {
    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();
     
    //     // webglrenderer.setSize( window.innerWidth, window.innerHeight );
    //     // cssrenderer.setSize( window.innerWidth, window.innerHeight ); 
    //   }
     
     
      
     
    //   $("#play").on('click', () => {
         
    //     player.playVideo();
    //     console.log("playing video");
        
    //     //HACKY WAY TO GET RID OF RANDOM DIV
    //     $("#play").hide();
    //     setTimeout(function(){ 
          
    //       $("div #videoframe").css("width", "0px");
    //       $("div #videoframe").css("height", "0px");
    //       $("div #videoframe").css("background-color", "yellow");
     
    //       $("iframe").css("width", "480px");
    //       $("iframe").css("height", "360px");
    //       $("iframe").css("background-color", "black");
    //    }, 1000);
    //   });
      /**
       * 유튜브 로딩을 위한 함수 끝
       */
     


    
    // function OnKeyDown(e) {

    //     return;
    // }

    // _onkeydown()
    // {
    //     const horse = this._cube;
    //     addEventListener('keydown', function(event)
    //     {
    //         switch(event.code)
    //         {
    //             case 'KeyW':                
    //             //this._cube.position.set( 0, 0, 0);
    //             horse.position.x += 0.5;
    //                 // this._hrose.
    //                 break;
    //             case 'KeyS':             
    //             horse.position.x -= 0.5;       
    //                 // this._horse.position.x -= 3;
    //                 break;
    //             case 'KeyA':
    //                 horse.position.z += 0.5;
    //                 // this._horse.position.z += 3;
    //                 break;
    //             case 'KeyD':
    //                 horse.position.z -= 0.5;
    //                 // this._horse.position.z -= 3;
    //                 break;
    //         }

    //         // console.log(event.code);
    //     });
    // }
    
    // _processAnimation()
    // {
    //     const previousAnimationAction = this._currentAnimationAction;

    //     if( this._pressedKey["w"] || this._pressedKey["a"] || this._pressedKey["s"] || this._pressedKey["d"] )
    //     {
    //         if( this._pressedKey["shift"] )
    //         {
    //            this._currentAnimationAction = this._animationMap["Run"];
    //            //this._speed = 4;
    //            this._maxSpeed = 9;
    //            this._acceleration = 1;

    //         }   
    //         else
    //         {
    //             this._currentAnimationAction = this._animationMap["Walk"];
    //             //this._speed = 1.2;
    //             this._maxSpeed = 4.5;
    //             this._acceleration = 0.5;
    //         }     
    //     }
    //     else
    //     {
    //         this._currentAnimationAction = this._animationMap["Idle"];
    //         this._speed = 0;
    //         this._maxSpeed = 0;
    //         this._acceleration = 0;
    //     }

    //     if( previousAnimationAction !== this._currentAnimationAction)
    //     {
    //         previousAnimationAction.fadeOut( 0.5 );
    //         this._currentAnimationAction.reset().fadeIn(0.5).play();
    //     }
    // }

    _processAnimation()
    {
        const previousAnimationAction = this._currentAnimationAction;
        const joystickValue = Math.abs(joystick1.value.x) + Math.abs(joystick1.value.y);

        //console.log(joystickValue);
        //if(this._pressedKeys["w"] ||this._pressedKeys["a"] ||this._pressedKeys["s"] ||this._pressedKeys["d"])
        if(joystick1.active && joystickValue > 0)
        {
            if(joystickValue <  0.9)
            {
                this._currentAnimationAction = this._animationMap["Walk"];
                this._maxSpeed = 2.5;
                this._acceleration = 0.04;
            }
            else
            {
                this._currentAnimationAction = this._animationMap["Run"];
                this._maxSpeed = 7.0;
                this._acceleration = 0.08;
            }

        }
        // else if(this._pressedKeys["w"] ||this._pressedKeys["a"] ||this._pressedKeys["s"] ||this._pressedKeys["d"])
        // {
        //     if(this._speed <  2.0)
        //     {
        //         this._currentAnimAction = this._animMap["Walk"];
        //         this._maxSpeed = 2.5;
        //         this._acceleration = 0.04;
        //     }
        //     else
        //     {
        //         this._currentAnimAction = this._animMap["Run"];
        //         this._maxSpeed = 7.0;
        //         this._acceleration = 0.08;
        //     }

        // }
        else
        {
            this._currentAnimationAction = this._animationMap["Idle"];
            this._speed = 0;
            this._maxSpeed = 0;
            this._acceleration = 0;
        }

        if(previousAnimationAction !== this._currentAnimationAction)
        {
            previousAnimationAction.fadeOut(0.8);
            this._currentAnimationAction.reset().fadeIn(0.2).play();
        }
    }

    _setupControls()
    {
       this._control = new OrbitControls(this._camera, this._divContainer);
       this._control.target.set(0,100,0);
       this._control.enablePan = false;
       this._control.enableDamping = true;


       const stats = new Stats();
       this._divContainer.appendChild(stats.dom);
       this._fps = stats;

       this._pressedKey = {};

       document.addEventListener("keydown", (event) => {
        this._pressedKey[event.key.toLowerCase()]= true;
        this._processAnimation();
       });

       document.addEventListener("keyup", (event) => {
        this._pressedKey[event.key.toLowerCase()]= false;
        this._processAnimation();
       });
    }

    _setupCamera()
    {
        //const width = this._divContainer.clientWidth;
        //const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth/window.height,
            1,
            1000
        );

        // const aspect = window.innerwidth/window.innerHeight;
        // const camera = new THREE.OrthographicCamera(
        //     -1*aspect, 1*aspect, // xleft,xRight
        //     1, -1, // ytop, ybottom
        //     0.1, 100 // zNear, zFar
        // )
        // Camera.zoom = 0.15;

        camera.position.set(10,100,100);
        //camera.lookAt(0,0,0);

        this._camera = camera;
    }

    _setupDirectionalLight( x, y, z, tx, ty, tz, col, intensity)
    {
        const directionalLight = new THREE.DirectionalLight(col, intensity);
        directionalLight.position.set( x, y, z );
        directionalLight.target.position.set(tx,ty,tz);
        directionalLight.castShadow = true;
        this._scene.add(directionalLight);
        this._directionalLight = directionalLight;
        

        // 헬퍼 객체
         const helper = new THREE.DirectionalLightHelper(directionalLight);
         this._scene.add(helper);
    }
    _setupLight()
    {
        const color = 0xFFE69D;
        const intensity = 1;
        const directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set( 5, 148, 0 );
        directionalLight.target.position.set(0,0,0);
        
        this._scene.add(directionalLight);
        this._scene.add(directionalLight.target);
        this._directionalLight = directionalLight;        

        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.heught = 1024;
        directionalLight.shadow.camera.top = directionalLight.shadow.camera.right = 70;
        directionalLight.shadow.camera.bottom = directionalLight.shadow.camera.left = -70;
        directionalLight.shadow.camera.near =50;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.radius = 5;
        const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        this._scene.add(directionalLightHelper);
        // 헬퍼 객체
        const helper = new THREE.DirectionalLightHelper(directionalLight, 10); 
        this._scene.add(helper);


        const ambientLight = new THREE.AmbientLight( 0xFFE69D, 2);
        ambientLight.position.set(0, 0, 0);
        this._scene.add(ambientLight);
         
        // const directionalLight2 = new THREE.DirectionalLight(color, 0.6);
        // directionalLight2.position.set(40, 20, -20 );
        // directionalLight2.target.position.set(0,0,30);
        // this._scene.add(directionalLight2);
        // const helper2 = new THREE.DirectionalLightHelper(directionalLight2, 10);
        // this._scene.add(helper2);

        //  this._setupDirectionalLight( -28, 28, 8, 0, 0, 0, 0xff0000, 3);
        
        //  const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        //  this._scene.add(cameraHelper);
        //  this._cameraHelper = cameraHelper;
        
        // const AmbientLight = new THREE.AmbientLight(0xffffff, 1);        
        // this._scene.add(AmbientLight);         
        

        // 위와 아래에서 비치는 빛 설정.
        //   const HemisphereLight = new THREE.HemisphereLight("#ffff00", "#ffffff", 0.2);
        //   HemisphereLight.position.set(0, 5, 0);
        //   HemisphereLight.intensity = 0.3;
        //   //HemisphereLight.target.position.set(0, 1, -3);
        //   this._scene.add(HemisphereLight);
        //   const Henuhelper = new THREE.HemisphereLightHelper(HemisphereLight);
        //   this._scene.add(Henuhelper);

        //   console.log(Henuhelper);

        // // 포인트라이트
        // const pointLight = new THREE.PointLight(0xff0000, 2);
        // pointLight.position.set( -3, 3, 0);
        // pointLight.distance = 5;    // pointLight 는 거리값이 있다. 0 무한

        // const pointLightHelper = new THREE.PointLightHelper(pointLight);
        // this._scene.add(pointLightHelper);
        // this._scene.add(pointLight);

        // 스폿라이트
        // const SpotLight = new THREE.SpotLight(0xff0000, 5);
        // SpotLight.position.set(0, 3, 0);
        // SpotLight.target.position.set(0,0,0);
        // SpotLight.angle = THREE.MathUtils.degToRad(40);
        // SpotLight.penumbra = 0; // 빛의 감쇠율 0 ~ 1
        // const spotHelper = new THREE.SpotLightHelper(SpotLight);
        // this._scene.add(spotHelper);

        // this._scene.add(SpotLight);
    }

    // 형광등이나, 창문에서 들어오는 빛.
    _setupRectAreaLight()
    {
        // const color = 0xffffff;
        // const intensity = 1;
        // const directionalLight = new THREE.DirectionalLight(color, intensity);
        // directionalLight.position.set( 0, 5, 0 );
        // directionalLight.target.position.set(0,0,0);
        // this._scene.add(directionalLight);

        // const directionalLighthelper = new THREE.DirectionalLightHelper(directionalLight);
        // this._scene.add(directionalLighthelper);
        // this._directionalLgithHelper = directionalLighthelper;

        RectAreaLightUniformsLib.init();

        const light = new THREE.RectAreaLight(0x0000ff, 10, 6, 3);
        light.position.set(0,3,0);
        light.rotation.x = THREE.MathUtils.radToDeg(40);

        const helper = new RectAreaLightHelper(light);
        light.add(helper);
        this._scene.add(light);

    }

    _setEnvironmentMap()
    {

    }

    _makeBoxGemetry( x, y, z )
    {
        const geometry = new THREE.BoxGeometry(1,1,1);        
        const material = new THREE.MeshPhongMaterial({color:0x0000ff});

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x,y,z);
        
        cube.castShadow = true;
        
        this._scene.add(cube);
        this._cube = cube;

        this._worldOctree.fromGraphNode(cube);
    }

    _makePlangeometry()
    {
        const loader = new THREE.TextureLoader();
        loader.setPath('model/outlet_20220620/checkout/');
        const texture = loader.load('Tile01.png');

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8);

        const geometry = new THREE.PlaneGeometry( 200, 200 );
        const material = new THREE.MeshStandardMaterial( {color:0x878787, map:texture});//, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( geometry, material );                
         plane.position.set(0, -0.1, 0);
        plane.rotation.x = -Math.PI /2;
        this._scene.add( plane );
        plane.receiveShadow = true;

        //console.log(plane);

        this._worldOctree.fromGraphNode(plane);
    }

    
    _loadingModel( path, model)
    {
        new GLTFLoader().load(path + model, (gltf) =>{

            const model = gltf.scene;
            this._scene.add(model);

            model.traverse(child => {
                if( child instanceof THREE.Mesh)
                {
                    child.castShadow=true;
                }
            });
        });
    }

    _loadingModel()
    {

        let textureEquirec, alphaMapImg;
        let sphereMaterial, sphereMesh;


        const alphaMap = new THREE.TextureLoader();
        alphaMapImg = alphaMap.load( './model/outlet_20220620/tool_trans/alphamap.png' );

        const textureLoader = new THREE.TextureLoader();
        textureEquirec = textureLoader.load( './model/outlet_20220620/evnMap.png' );
        textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        textureEquirec.encoding = THREE.sRGBEncoding;

        const cubeTextureLoader = new THREE.CubeTextureLoader()

        const environmentMapTexture = cubeTextureLoader.load([
            './model/outlet_20220620/evnMap.png',
            './model/outlet_20220620/evnMap.png',
            './model/outlet_20220620/evnMap.png',
            './model/outlet_20220620/evnMap.png',
            './model/outlet_20220620/evnMap.png',
            './model/outlet_20220620/evnMap.png'
        ]);

        // this._scene.background = textureEquirec;

        const geometry = new THREE.BoxGeometry( 5, 5, 5 );
        sphereMaterial = new THREE.MeshStandardMaterial();
        sphereMesh = new THREE.Mesh( geometry, sphereMaterial );
        sphereMesh.position.set(-10,3,0);
        sphereMaterial.metalness = 0.5;
        sphereMaterial.roughness = 0;
        // sphereMaterial.
        sphereMaterial.envMap = textureEquirec;
        // console.log(sphereMaterial);
        this._scene.add( sphereMesh );

        // new GLTFLoader().load("./model/outlet_20220620/tans/escal.gltf", (gltf) =>{

        //     const model = gltf.scene;
        //     model.position.set(12, 0, 0);      
        //     model.scale.set(1,1,1);
            
        //     model.traverse(child => {
        //         if( child instanceof THREE.Mesh)
        //         {
        //              child.material.envMap = textureEquirec;
        //             // child.material.roughness = 0;
        //             //  child.material.update();
        //             //child.material.opacity = 0.5;

        //              console.log(child.material);
        //             //child.material.wireframe = true;
        //             // child.material.side = THREE.FrontSide;
        //             // console.log(child.material);
        //         }
        //     });
        //     // model.material.envMap = textureEquirec;
        //     // console.log(model);
        //     this._scene.add(model);
        // });

        // new GLTFLoader().load("./model/outlet_20220620/tool_trans/Trans.gltf", (gltf) =>{

        //     const model = gltf.scene;
        //     model.position.set(12, 0, 0);      
        //     model.scale.set(1,1,1);
            
        //     model.traverse(child => {
        //         if( child instanceof THREE.Mesh)
        //         {
        //             child.material.envMap = textureEquirec;
        //             //  child.material.alphaMap = alphaMapImg;
        //             // child.material.roughness = 0;
        //             //  child.material.update();
        //             //child.material.opacity = 0.5;

        //              console.log(child);
        //             //child.material.wireframe = true;
        //             // child.material.side = THREE.FrontSide;
        //             // console.log(child.material);
        //         }
        //     });
        //     // model.material.envMap = textureEquirec;
        //     // console.log(model);
        //     this._scene.add(model);
        // });
        
        // for( let j = 0 ; j < 2 ; j++ ){
            // for ( let i = 0 ; i < 3 ; i++){
                new GLTFLoader().load("./model/mall/mall.gltf", (gltf) =>{
    
                    const model = gltf.scene;
                    // model.visible = false;
                    model.position.set( 0, 0 , 0 );
    
                    gltf.scene.traverse(child => {
                        
                        const name = child.name;

                         if( name.indexOf("Escal01") != -1){

                            child.traverse(child3 => {
                                if( child3 instanceof THREE.Mesh)
                                {
                                    // console.log(child.material);
                                    child3.material.envMap = textureEquirec;
                                     
                                    // child3.material.roughness = 0.2;
                                    //  console.log(child3.material);
                                }
                            });
                        }
        
                        if( name.indexOf("Omni") != -1){
                            // console.log(child.name);
                            const helper = new THREE.PointLightHelper(child); 
                            this._scene.add(helper);
        
                            // child.visible = false;
                        }
        
                        if( name.indexOf("Tile") != -1 )
                        {
                            child.material.roughness = 1;
                            // console.log(child);
                        }
                    });
        
                    this._scene.add(gltf.scene);
        
                    model.traverse(child => {
                        if( child instanceof THREE.Mesh)
                        {
                            const name = child.name;
                            
                            //console.log(name);
                            if( child.name.indexOf("Collider") != -1 ){
                                
                                // child.position.set(0,100,0);
                                child.visible = false;
                                this._worldOctree.fromGraphNode(child);
                            }
        
                            if( child.name.indexOf("Sphere001") != -1 ){
                                child.position.set(0, 8, 0);
        
                                //child.visible = false;
                            }                    
        
                            
        
                            child.castShadow=true;
                        }
                    });
                });
            // }
        // }
        
    
        
        

        // new GLTFLoader().load("./model/outlet_20220620/json/scene.gltf", (gltf) =>{

        //     const model = gltf.scene;

        //     gltf.scene.traverse(child => {
        //         if( child instanceof THREE.Light)
        //         {
        //             console.log(child.name);
        //             //if( child.name.indexOf("Spot001") != -1 ){
        //               //  const spotHelper = new THREE.SpotLightHelper(child);
        //                 //this._scene.add(spotHelper);
        //             //}
        //             //var direcitonalLight = child;  Editor 에서 뽑은 라이트의 강도를 조절해봄
        //             //direcitonalLight.intensity = 3;
        //             const helper = new THREE.DirectionalLightHelper(child, 10); 
        //             this._scene.add(helper);
        //         }
        // });

            

        //     model.position.set( 0, 10 , 0);
        //     this._scene.add(gltf.scene);

        // });

        

        new GLTFLoader().load("./model/ani/Soldier.glb", (gltf) =>
        {
            const model = gltf.scene;
            this._scene.add(model);
            
            model.traverse(child => {
                if( child instanceof THREE.Mesh)
                {
                    child.castShadow=true;                    
                }
            });
            // 해당 모델이 애니클립이 있으면 클립이름을 콘솔에 출력한다.
            const animationClips = gltf.animations; // THREE.AnimationClip[] 형.
            const mixer = new THREE.AnimationMixer(model);
            const animationsMap = {};
            animationClips.forEach(clip => {
            const name = clip.name;
            //console.log(name);
            animationsMap[name] = mixer.clipAction(clip); // THREE.AnimationAction 객체로 만들어주기도함.
            });
        
            this._mixer = mixer;
            this._animationMap = animationsMap;
            this._currentAnimationAction = this._animationMap["Idle"];
            this._currentAnimationAction.play();

            const box = (new THREE.Box3).setFromObject(model);
            //  model.position.y = 1550;//(box.max.y - box.min.y)/2;

            
            const height = box.max.y - box.min.y; // 캐릭터를 감싸는 바운딩 박스.
            const diameter = box.max.z - box.min.z;

            model._capsule = new Capsule(
                new THREE.Vector3( 0, diameter/2, 0),
                new THREE.Vector3(0, height - diameter/2, 0),
                diameter/2
            );

            // model.position.y = 10;

            const axisHelper = new THREE.AxesHelper(1000);
            this._scene.add(axisHelper);

            const boxHelper = new THREE.BoxHelper(model);
            this._scene.add(boxHelper);
            this._boxHelper = boxHelper;
            this._player = model;

            // const boxG = new THREE.BoxGeometry(2, 2, 2);
            // const boxM = new THREE.Mesh(boxG, planeMaterial);
            // boxM.receiveShadow = true;
            // boxM.castShadow = true;
            // boxM.position.set(0, 0, 0);
            // this._scene.add(boxM);    
            
            // this._worldOctree.fromGraphNode(boxM);
        });

        


        // loader.load('test2.gltf', function(gltf) => {
            
            // const mesh = gltf.scene;
            // this._scene
            
            // mesh.castShadow = true;
            // tthis._horse = mesh;
            // tthis._horse.position.y = 10;
            // scene.add(gltf.scene);

        // });

        // const loader2 = new GLTFLoader().setPath( 'model/glTF/' );
        // new GLTFLoader().load( 'model/glTF/DamagedHelmet.gltf', ( gltf ) =>
        // {
		// 					this._scene.add( gltf.scene );
                            
		// 				} );
        
        
        
    }

    

    _makeEmptyObject()
    {

    }

    _setupModel()
    {
         this._makeBoxGemetry( 5,1,0);        
        //   this._makePlangeometry();

        const scene = this._scene;

        // new RGBELoader()
		// 			.setPath( 'model/texture/' )
		// 			.load( 'royal_esplanade_1k.hdr', function ( texture ) {

		// 				// texture.mapping = THREE.EquirectangularReflectionMapping;

		// 				scene.background = texture;
		// 				scene.environment = texture;


        // // const loader = new GLTFLoader().setPath( 'model/glTF/' );
		// // 				loader.load( 'DamagedHelmet.gltf', function ( gltf ) {
                            
		// // 					scene.add( gltf.scene );

		// 				// } );
        //             });
        // const geometry = new THREE.BoxGeometry(1,1,1);        
        // const material = new THREE.MeshPhongMaterial({color:0x0000ff});

        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.set(0,1,0);
        // cube.receiveShadow = true;
        // cube.castShadow = true;


        // this._scene.add(cube);
        // this._cube = cube;

        // const planGeometry = new THREE.PlaneGeometry(20, 20);
        // const planMaterial = new THREE.MeshPhongMaterial({color:0xffffff});
        
        // const plan = new THREE.Mesh(planGeometry, planMaterial);
        // plan.position.set(0,0,0);
        // plan.rotateX(THREE.MathUtils.degToRad(-90));
        // plan.receiveShadow = true;
 
        // this._scene.add(plan);
        // this._plan = plan;

    }

     

    // _createPlaneVideo()
    // {
    //     var canvas = document.createElement("canvas");

    //     var canvasoutput = document.querySelector("#canvas-output");
    //     canvasoutput[0].appendChild(canvas);        

    //     var video = document.getElementById('video');
    //     texture = new THREE.Texture(video);
    //     texture.minFilter = THREE.LinearFilter;
    //     texture.magFilter = THREE.LinearFilter;
    //     texture.generateMipmaps = false;

    //     var canvasMap = new THREE.Texture(canvas);
    //     var mat = new THREE.MeshPhongMaterial();
    //     mat.map = canvasMap;

    //     const gemo = new THREE.PlaneGeometry( 20, 20 );

    //     var mesh = new THREE.Mesh(gemo, mat);

    //     this._scene.add(mesh);
    // }

    // 원본 코드
    // _Element( id, x, y, z, ry ) {

    //     const div = document.createElement( 'div' );        

    //     div.style.width = '480px';
    //     div.style.height = '360px';
    //     div.style.backgroundColor = '#000';

    //     const iframe = document.createElement( 'iframe' );
    //     iframe.style.width = '480px';
    //     iframe.style.height = '360px';
    //     iframe.style.border = '0px';
    //     iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
    //     div.appendChild( iframe );

    //     const object = new CSS3DObject( div );
    //     object.position.set( x, y, z );
    //     object.rotation.y = ry;

    //     this._scene.add(object);
    //     return object;
    // }

    /**
     * 
     * @param {*} id 불러올 주소 
     * @param {*} x  좌표
     * @param {*} y 
     * @param {*} z 
     * @param {*} ry 회전값
     * @returns 
     */
    // _Element( id, x, y, z, ry ) {

    //     // const div = document.createElement( 'div' );        

    //     this._divContainer.style.width = '480px';
    //     this._divContainer.style.height = '360px';
    //     this._divContainer.style.backgroundColor = '#000';

    //     const iframe = document.createElement( 'iframe' );
    //     iframe.style.width = '480px';
    //     iframe.style.height = '360px';
    //     iframe.style.border = '0px';
    //     iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
    //     this._divContainer.appendChild( iframe );

    //     const object = new CSS3DObject( this._divContainer );
    //     object.position.set( x, y, z );
    //     object.rotation.y = ry;

    //     this._scene.add(object);
    //     return object;
    // }

    resize()
    {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const aspect = width/ height;

        if( this._camera instanceof THREE.PerspectiveCamera )
        {
            this._camera.aspect = aspect;

        }
        else
        {
            this._camera.left = -1 * aspect;
            this._camera.right = 1 * aspect;
        }

        this._camera.updateProjectionMatrix();
        this._renderer.setSize(width, height);
        // this._composer.setSize( width, height );
    }


    render(time)
    {
        
        this._renderer.render(this._scene, this._camera);
        //  this._cssrenderer.render(this._cssscene, this._camera);     
        this.update(time);
        requestAnimationFrame(this.render.bind(this)); // redner 메서드가 계속 호출되게 한다.
        
        
        
        // this._composer.render(time);
          
        
    }

    

    // _directionOffset() {
    //     const pressedKeys = this._pressedKey;
    //     let directionOffset = 0; // w

    //     if (pressedKeys['w']) {
    //         if (pressedKeys['a']) {
    //             directionOffset = Math.PI / 4 // w+a (45도)
    //         } else if (pressedKeys['d']) {
    //             directionOffset = - Math.PI / 4 // w+d (-45도)
    //         }
    //     } else if (pressedKeys['s']) {
    //         if (pressedKeys['a']) {
    //             directionOffset = Math.PI / 4 + Math.PI / 2 // s+a (135도)
    //         } else if (pressedKeys['d']) {
    //             directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d (-135도)
    //         } else {
    //             directionOffset = Math.PI // s (180도)
    //         }
    //     } else if (pressedKeys['a']) {
    //         directionOffset = Math.PI / 2 // a (90도)
    //     } else if (pressedKeys['d']) {
    //         directionOffset = - Math.PI / 2 // d (-90도)
    //     }
    //     else{
    //         directionOffset = this._previousDirectionOffset;
    //     }

    //     this._previousDirectionOffset = directionOffset

    //     return directionOffset;        
    // }

    _preDirOff = Math.PI/2;
    _angleCameraDirAxisY = Math.PI;
    _directionOffset()
    {
        return this._JoysticDir();

        //if(joystick1.active)
            //return this._JoysticDir();

        //else
            //return this._KeyDir();
    }

    _JoysticDir()
    {
        let directionOffset = Math.PI / 2;

        const pressValue = Math.abs(joystick1.value.x) * Math.abs(joystick1.value.y);

        
        if(pressValue > 0)
        {
            if(joystick1.active)
            {
                this._angleCameraDirAxisY = Math.atan2(( this._camera.position.x- this._player.position.x),
                                                       (this._camera.position.z - this._player.position.z)) + Math.PI;
    
                directionOffset = Math.atan2(joystick1.value.x ,joystick1.value.y);
            }
        }     
        else
        {
            directionOffset = this._preDirOff;
        }

        this._preDirOff = directionOffset;

        
        return directionOffset;
    }

    _PlayerDirUpdate(deltaTime)
    { 
        
        let rotateQuarternion = new THREE.Quaternion();

        
        rotateQuarternion.setFromAxisAngle(new THREE.Vector3(0,1,0),
                                            this._angleCameraDirAxisY + this._directionOffset());   

                                           

                                            
         this._player.quaternion.rotateTowards(rotateQuarternion, THREE.MathUtils.degToRad(5));


        const walkDir  = new THREE.Vector3();

        this._camera.getWorldDirection(walkDir);

        walkDir.y = this._bOn_Ground ? 0 : -1;
        walkDir.normalize();
        walkDir.applyAxisAngle(new THREE.Vector3(0,1,0), this._directionOffset());
        
        if(this._speed < this._maxSpeed) 
            this._speed += this._acceleration;
        else
            this._speed -= this._acceleration * 2;
   
        if(!this._bOn_Ground)
        {
            this._fallingAcceleration += 0.0;
            this._fallingSpeed += Math.pow(this._fallingAcceleration, 2);
        }
        else
        {
            this._fallingAcceleration = 0;
            this._fallingSpeed = 0;
        }


        const velocity = new THREE.Vector3(
            walkDir.x * this._speed * -1,
            walkDir.y * this._fallingSpeed,
            walkDir.z * this._speed * -1
        )

        const deltaPos = velocity.clone().multiplyScalar(deltaTime);


        this._player._capsule.translate(deltaPos);

        

        const result = this._worldOctree.capsuleIntersect(this._player._capsule);
        if(result)
        {
            this._player._capsule.translate(result.normal.multiplyScalar(result.depth));
            this._bOn_Ground = true;
        }
        else
        {
            this._bOn_Ground = false;
        }

        

        const prevPos = this._player.position.clone();
        const capsuleHeight = this._player._capsule.end.y - this._player._capsule.start.y + this._player._capsule.radius*2;

        this._player.position.set(
            this._player._capsule.start.x,
            (this._player._capsule.start.y - this._player._capsule.radius + capsuleHeight/2)-0.9,
            this._player._capsule.start.z
        );

        //this._camera.position.x += move_x;
        //this._camera.position.z += move_z;
        this._camera.position.x -= prevPos.x - this._player.position.x;
        this._camera.position.z -= prevPos.z - this._player.position.z;

        this._control.target.set(
            this._player.position.x,
            this._player.position.y + 1.0,
            this._player.position.z
        )
    }

    _speed = 0;
    _maxSpeed = 0;
    _acceleration = 0;

    _previousDirectionOffset = 0;

    _bOnTheGround = false; // 바닥위에 있는지 여부 체크
    _fallingAcceleration = 0;
    _fallingSpeed = 0;

    update(time)
    {
        time*=0.001;

        this._control.update();

        if(this._boxHelper) {
            this._boxHelper.update();
        }

        this._fps.update();

        const deltaTime = time - this._previousTime;

        if( this._mixer )
        {
            this._mixer.update(deltaTime);
            this._PlayerDirUpdate(deltaTime);
            this._processAnimation();


            // 
            // 

            // const angleCameraDirectionAxisY = Math.atan2(
            //     (this._camera.position.x - this._player.position.x),
            //     (this._camera.position.z + this._player.position.z)
            // );//- Math.PI;

            // const rotateQuarternion = new THREE.Quaternion();
            // rotateQuarternion.setFromAxisAngle(
            //     new THREE.Vector3(0,1,0),
            //     angleCameraDirectionAxisY + this._directionOffset()
            // );

            //  this._player.quaternion.rotateTowards(rotateQuarternion, THREE.MathUtils.degToRad(5));

            //  const walkDirection = new THREE.Vector3();
            //  this._camera.getWorldDirection(walkDirection);

            //  //walkDirection.y = 0;
            //  walkDirection.y = this._bOnTheGround ? 0 : -1;
            //  walkDirection.normalize();

            //  walkDirection.applyAxisAngle(new THREE.Vector3(0,1,0), this._directionOffset());

            //  if( this._speed < this._maxSpeed ) this._speed += this._acceleration;
            //  else this._speed -= this._acceleration*2;

            // //  if( !this._bOnTheGround){
            // //     this._fallingAcceleration += 1;
            // //     this._fallingSpeed += Math.pow(this._fallingAcceleration, 2);
            // //  }else{
            // //     this._fallingAcceleration = 0;
            // //     this._fallingSpeed = 0;
            // //  }

            //  const velocity = new THREE.Vector3(
            //     walkDirection.x * this._speed,
            //     walkDirection.y * this._fallingSpeed,
            //     walkDirection.z * this._speed
            //  );

             

            //   //const moveX = walkDirection.x * (this._speed * deltaTime);
            //   //const moveZ = walkDirection.z * (this._speed * deltaTime);

            // //  this._model.position.x += moveX;
            // //  this._model.position.z += moveZ;

            // const deltaPosition = velocity.clone().multiplyScalar(deltaTime);
            //  const result = this._worldOctree.capsuleIntersect(this._player._capsule);
            //  if(result){ // 충돌한 경우.
            //     this._player._capsule.translate(result.normal.multiplyScalar(result.depth));
            //     this._bOnTheGround = true;
            //  }else{ // 충돌하지 않은 경우.
            //     this._bOnTheGround = false;
            //  }

            //  const previousPosition = this._player.position.clone();
            //  const capsuleHeight = this._player._capsule.end.y - this._player._capsule.start.y
            //  + this._player._capsule.radius*2;

            //  this._player.position.set(
            //     this._player._capsule.start.x, 
            //     this._player._capsule.start.y - this._player._capsule.radius + capsuleHeight/2, 
            //     this._player._capsule.start.z
            // );    

            // this._player._capsule.translate(deltaPosition);

            // // this._camera.position.x += moveX;
            // // this._camera.position.z += moveZ;
            // this._camera.position.x -= previousPosition.x - this._player.position.x;
            // this._camera.position.z -= previousPosition.z - this._player.position.z;

            // this._control.target.set(
            //     this._player.position.x,
            //     this._player.position.y,
            //     this._player.position.z
            //  );

        }

        this._previousTime = time;
    }

   
}

var player;
window.onYouTubeIframeAPIReady = function () 
      {
        console.log("onYouTubeIframeAPIReady");
        player = new YT.Player('videoframe', {
          height: '2160',
          width: '100%',
          videoId: 'pYzX7cqK_JQ',
          
          playerVars: {
            autoplay: 0,
            suggestedQuality: 'highdef',
            modestbranding: 'true',
            controls: '0',
            cc_load_policy: 3,
            fs: 0,
            loop: 1,
            playsinline: 1,
            showinfo: 0,
            rel: 0,
            disablekb: 1,
            ecver: 2,
            
          },
          events: {
            'onReady': function(evt){
                console.log("onReady");
                
                // evt.target.mute();
                evt.target.playVideo();


            //     player.sendMessage = function (a) {
            //         a.id = this.id, a.channel = "widget", a = JSON.stringify(a);
                    
            //         var url = new URL(this.h.src);
            //         var origin = url.searchParams.get("origin");
            //         if (origin && this.h.contentWindow) {
            //             this.h.contentWindow.postMessage(a, origin)
            //         }
            //   }
            },
          }
        });

        

      function _onPlayerReady(event)
      {
        console.log("_onPlayerReady");
        event.target.playVideo();
      }

    }

window.onload=function()
{
    new App();
}