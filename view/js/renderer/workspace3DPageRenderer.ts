//import * as BABYLON from '@babylonjs/core/Legacy/legacy';
//import * as GUI from '@babylonjs/gui/legacy/legacy';
import {
	Scene, 
	Engine, 
	Color4, 
	Vector3, 
	ArcRotateCamera,
	AssetsManager,
	ActionManager,
	HemisphericLight,
	Animation,
	ExecuteCodeAction,
	IAnimationKey,
	SceneLoader, 
	ISceneLoaderProgressEvent,
	AbstractMesh,
	Mesh,
	Color3,
	PointLight,
	SpotLight
} from '@babylonjs/core';
import {
	AdvancedDynamicTexture,
	Rectangle,
	TextBlock,
	Control
} from '@babylonjs/gui';
import "@babylonjs/loaders/glTF"
//import { any } from '@tensorflow/tfjs';
import common from './../common'; 
//import {  } from 'babylonjs';
//import * as BABYLON from 'babylonjs'
//import * as GUI from 'babylonjs-gui'
/// <reference path="https://preview.babylonjs.com/babylonjs.d.ts"/>
/// <reference path="https://preview.babylonjs.com/loaders/babylonjs.loaders.d.ts"/>
//import 'babylonjs-loaders'

import HeaderDefault from "./../component/header/HeaderDefault"

window.customElements.define('header-default', HeaderDefault);
new class Workspace3DPageRenderer{
    private canvas : HTMLCanvasElement; 
	private scene : Scene;
	private camera : ArcRotateCamera;
	private engine : Engine;
    private loader : AssetsManager;
    private light : HemisphericLight;
	//private fishObj : BABYLON.ISceneLoaderAsyncResult;
	private isFollowCam : Boolean = false;

	private projectPath : Promise<String>;

	private radius = 2.9880226345180027;
	private alpha = 1.638052278839269;
	private beta = 1.1405567698725234;
	private x = -0.03477393733415595;
	private y = 2.918814528741556;
	private z = 0.8905547236474616;
	constructor(){
		this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		//공간 선언/
		this.scene = new Scene(this.engine);
		this.light = new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);
		//this.light.intensity = 0.2;
		this.loader = new AssetsManager(this.scene);
		this.loader.useDefaultLoadingScreen = false;
		//카메라의 3차원 위치 설정
		this.camera = new ArcRotateCamera("Camera", this.alpha, this.beta, this.radius, new Vector3(this.x, this.y, this.z), this.scene);
        this.camera.upperAlphaLimit = 2.5;
		this.camera.lowerAlphaLimit = 0.85;
		this.camera.upperBetaLimit = 2;
		this.camera.lowerBetaLimit = 0.5;
		this.camera.upperRadiusLimit = this.radius;
		this.camera.lowerRadiusLimit = this.radius - 1;
		this.camera.panningDistanceLimit = 0.1;
        this.camera.attachControl(this.canvas, true);
		this.camera.onViewMatrixChangedObservable.add(()=>{
			//console.log('alpha',this.camera.alpha);
			//console.log('beta',this.camera.beta);
		})

		this.camera.speed = 0.25;
		this.camera.wheelDeltaPercentage = 0.01;

        this.projectPath = common.getProjectPathPromise();
        this.run3Dview();
		window.addEventListener("resize", () => {
			this.engine.resize();
		});
	}

    async create3DView(){
        //this.scene.autoClear = false
		//공간 배경 색상 설정
		this.scene.clearColor = new Color4(0, 0, 0, 0);
        this.setCamera(this.camera, undefined);

        this.loadChair().then((result)=>{
            console.log('loadChair',result)
        })
        this.loadDeskLamp().then((result)=>{
			let meshObejects = result.meshes.reduce<Record<string, Mesh>>((t,e)=>{
				t[e.id] = e as Mesh;
				return t;
			}, {});
			let lampButton = meshObejects['Cube.028']; 
			let lampLightPanel = meshObejects['Cylinder.003'];

			(lampLightPanel.material as any).albedoColor = Color3.FromHexString("#252525de").toLinearSpace();
			(lampLightPanel.material as any).emissiveColor = Color4.FromHexString('#252525de');
			let lampLight = new SpotLight("lampSpotLight", 
				new Vector3(1, 3, 0),
				new Vector3(-1, -1, 0),
				Math.PI,
				1,
				this.scene
			);
			lampLight.diffuse = Color3.FromHexString('#ffffff');
			lampLight.specular = Color3.FromHexString('#ffffff');
			//lampLight.includedOnlyMeshes = [lampLightPanel];
			lampLight.intensity = 0;
			let isLamp = false;
			//let lampButtonPosition = lampButton.position;
			lampButton.actionManager = new ActionManager(this.scene);
			lampButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
				isLamp = ! isLamp;
				if(isLamp){
					(lampLightPanel.material as any).albedoColor = Color3.FromHexString("#ffffff").toLinearSpace();
					(lampLightPanel.material as any).emissiveColor = Color4.FromHexString('#ffffff');
					lampLight.intensity = 50;
					lampButton.rotation = new Vector3(0, (Math.PI * -1) + 0.5 ,0)
				}else{
					//this.scene.removeMesh(lampLightPanel);
					//this.scene.addMesh(lampLightPanel);
					(lampLightPanel.material as any).albedoColor = Color3.FromHexString("#252525de").toLinearSpace();
					(lampLightPanel.material as any).emissiveColor = Color4.FromHexString('#252525de');
					lampLight.intensity = 0;
					lampButton.rotation = new Vector3(0,0.5,0)
				}
			}))
            console.log('loadDeskLamp',result)
        })
        this.loadComputerTable().then((result)=>{
            console.log('loadComputerTable',result)
			result.meshes[0]
        })
        this.loadLowPolyFan().then((result)=>{
            console.log('loadLowPolyFan',result)
			let meshObejects = result.meshes.reduce<Record<string, Mesh>>((t,e)=>{
				t[e.id] = e as Mesh;
				return t;
			}, {});
			//let fanButton = meshObejects['motor area.003'];

			let rotaionSpeed = 20
			let motor = meshObejects['motor_area_and_fan_primitive1'];
			motor.animations = [];
			const moveFanFunction = (fan : Mesh) =>{
				//fan.animations = [];

				let keys : IAnimationKey[] = []; 
				let yRotation = new Animation('yRotation', 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
		
				yRotation.vector3InterpolateFunction = (startValue, endValue, gradient) => {
					return Vector3.Lerp(startValue, endValue, gradient);
				};
		
				let rotationSpeed = fan.rotation.y + rotaionSpeed;
		
				// Animation keys
				keys.push(
					{frame: 0,value: fan.rotation},
					{frame: 60,value: new Vector3(0, rotationSpeed, 0)}
				);
		
				// Set keys and push animation
				yRotation.setKeys(keys);
				fan.animations.push(yRotation);
		
				// Start animation
				return this.scene.beginAnimation(fan, 0, 60, true);
			}
			let motorAnimation = moveFanFunction(motor);
			motorAnimation.stop();
			let net =  meshObejects['leg'];
			let isMotorStart = false;
			net.actionManager = new ActionManager(this.scene);
			net.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
				isMotorStart = ! isMotorStart;
				if(isMotorStart){
					//motorAnimation.restart();
					motorAnimation = moveFanFunction(motor);
				}else{
					motorAnimation.stop();
				}
			}));
			/*let fanList = [meshObejects['Plane.002'], meshObejects['Plane.004'], meshObejects['Plane.005']];
			
			fanList.forEach((fan, i) => {
				console.log(fan);
				fan.rotation = new Vector3(-3, 2, -1);
				moveFanFunction(fan);
			})*/
        })
		//let projectPath = await this.projectPath
		//SceneLoader.ImportMeshAsync(null, projectPath+"view\\model\\", "chair2.glb", this.scene, (event: ISceneLoaderProgressEvent)=>{/*LoaderProgress*/})
        //.then((result)=>{
		//	console.log('test>>>', result);
		//})
		const xrPromise = this.scene.createDefaultXRExperienceAsync({});
        return xrPromise.then((xrExperience) => {
			console.log("Done, WebXR is enabled.");
			return this.scene;
		});
    }

    async loadChair(){
        let projectPath = await this.projectPath
        return SceneLoader.ImportMeshAsync(null, projectPath+"view\\model\\", "chair.glb", this.scene, (event: ISceneLoaderProgressEvent)=>{/*LoaderProgress*/})
    }
    async loadDeskLamp(){
        let projectPath = await this.projectPath
        return SceneLoader.ImportMeshAsync(null, projectPath+"view\\model\\", "desk_lamp.glb", this.scene, (event: ISceneLoaderProgressEvent)=>{/*LoaderProgress*/})
    }
    async loadComputerTable(){
        let projectPath = await this.projectPath
        return SceneLoader.ImportMeshAsync(null, projectPath+"view\\model\\", "computer_table.glb", this.scene, (event: ISceneLoaderProgressEvent)=>{/*LoaderProgress*/})
    }
    async loadLowPolyFan(){
        let projectPath = await this.projectPath
        return SceneLoader.ImportMeshAsync(null, projectPath+"view\\model\\", "low_poly_fan.glb", this.scene, (event: ISceneLoaderProgressEvent)=>{/*LoaderProgress*/})

    }

    setCamera(camera : any, option : {
        x : number, y : number, z : number, 
        beta : number, alpha: number, radius: number
    } | undefined){
        if(option){
            Object.assign(camera, option);
            return;
        }
        return;
		camera.x = -47.8774;
		camera.y = 41.8426;
		camera.z = 21.137114;
		camera.beta = 1.289062431626049;
		camera.alpha = -9.4728763141085;
		camera.radius = 75.07074702067573;
    }
	run3Dview(){
		this.create3DView().then((scene : Scene) => {
			this.engine.runRenderLoop(() => scene.render());
            this.canvas.setAttribute('is_canvas_run', 'Y')
		});

	}
	
	end3Dview(){
		this.scene.dispose();
		this.canvas.style.display = 'none';
		this.canvas.setAttribute('is_canvas_run', 'N');
	}

	reloadScene(){
		if(this.canvas.getAttribute('is_canvas_run') === 'Y'){
			this.scene.dispose();
			this.create3DView().then((scene : Scene) => {
				this.engine.runRenderLoop(() => scene.render());
				this.canvas.setAttribute('is_canvas_run', 'Y')
			});
		}
	}

}