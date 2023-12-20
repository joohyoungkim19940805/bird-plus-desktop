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
	SceneLoader
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
//import * as BABYLON from 'babylonjs'
//import * as GUI from 'babylonjs-gui'
/// <reference path="https://preview.babylonjs.com/babylonjs.d.ts"/>
/// <reference path="https://preview.babylonjs.com/loaders/babylonjs.loaders.d.ts"/>
//import 'babylonjs-loaders'
class Temp3DHandler {
	private canvas : HTMLCanvasElement; 
	private scene : Scene;
	private camera : any;
	private engine : Engine;
	//private fishObj : BABYLON.ISceneLoaderAsyncResult;
	private isFollowCam : Boolean = false;

	private projectPath : String;

	constructor(){
		this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		//공간 선언/
		this.scene = new Scene(this.engine);
		this.projectPath = ''
		common.getProjectPathPromise().then((projectPath : String) => {
			this.projectPath = projectPath;
			document.body.style.backgroundImage = 'url("./../image/pexels-francesco-ungaro.jpg")'
			document.body.style.backgroundSize = 'cover'
			document.body.style.backgroundRepeat = 'round';
			this.run3Dview();
		})
		window.addEventListener("resize", () => {
			this.engine.resize();
		});
	}

	async view3DCreate() {
		this.scene.autoClear = false
		//공간 배경 색상 설정
		this.scene.clearColor = new Color4(0, 0, 0, 0);

		//카메라의 3차원 위치 설정
		const alpha =  Math.PI/-2;
		const beta = Math.PI/3; 
		const radius = 17;
		const target = new Vector3(0, 5, 5);
		//카메라의 초기 위치 셋팅
		this.camera = new ArcRotateCamera("Camera", alpha, beta, radius, target, this.scene);
		this.camera.attachControl(this.canvas, true);
		this.camera.setTarget(Vector3.Zero());
		this.camera.speed = 0.5;
		this.camera.wheelDeltaPercentage = 0.01;
		this.camera.x = -47.8774;
		this.camera.y = 41.8426;
		this.camera.z = 21.137114;
		this.camera.beta = 1.289062431626049;
		this.camera.alpha = -9.4728763141085;
		this.camera.radius = 75.07074702067573;
		this.camera.maxCameraSpeed = 5
		//camera.detachControl();
		//광원 생성
		//const light = new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);
		const loader = new AssetsManager(this.scene);
		//let cannon = true;
		//let forceFactor = cannon ? 1 : 1500;
		let sharks : any = loader.addMeshTask("sharks", "", this.projectPath+"view\\model\\", "waltz_of_the_sharks.glb");
		sharks.onSuccess = () => {
			console.log(sharks)
			sharks.loadedMeshes[0].position.x = 120;
		}
		sharks.onError = (obj: any, message: any, exception: any) => {
            console.log(obj, message, exception);
        }

		let museum : any = loader.addMeshTask("museum", "", this.projectPath+"view\\model\\", "museum2.glb");
		museum.onSuccess = () => {
			console.log(museum)
			museum.loadedMeshes[0].position.x = 110;
			museum.loadedMeshes[0].position.y = -15;
			museum.loadedMeshes[0].position.z = 15;
			let advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
			advancedTexture.useInvalidateRectOptimization = false;

			let guiRect = Object.assign( new Rectangle(),{
					width : '400px',
					height : '400px',
					thickness : 2,
					linkOffsetX : '250px',
					linkOffsetY : '200px',
					transformCenterX : 0,
					transformCenterY : 0,
					background : 'grey',
					alpha : 0.7,
					scaleX : 0,
					scaleY : 0,
					cornerRadius : 30
			});

			advancedTexture.addControl(guiRect);
			guiRect.linkWithMesh( museum.loadedMeshes[1] ); 
			let hoverText = Object.assign( new TextBlock(), {
				color : "White",
				fontSize : 45,
				textWrapping : true,
				textVerticalAlignment : Control.HORIZONTAL_ALIGNMENT_CENTER,
				background : '#006994',
				width : '200px',
				height : '200px'
			});
			guiRect.addControl(hoverText);
			
			hoverText.alpha = (1/hoverText.alpha);
			hoverText.paddingTop = '10px',
			hoverText.paddingBottom = '10px',
			hoverText.paddingLeft = '10px',
			hoverText.paddingRight = '10px'
			hoverText.text = '먹혀버린 물고기'

			let guiScaleXAnimation = new Animation("guiScaleXAnimation", "scaleX", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
			let guiScaleYAnimation = new Animation("guiScaleYAnimation", "scaleY", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
			let key = [
				{
					frame : 0, value : 0
				},
				{
					frame : 10, value : 1
				}
			]
			guiScaleXAnimation.setKeys(key);
			guiScaleYAnimation.setKeys(key);
			guiRect.animations = [];
			guiRect.animations.push(guiScaleXAnimation);
			guiRect.animations.push(guiScaleYAnimation);
			museum.loadedMeshes[1].actionManager = new ActionManager(this.scene);
			let isOpenGuiWrap = false;
			museum.loadedMeshes[1].actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
					if(isOpenGuiWrap == false){
						this.camera.lockedTarget = museum.loadedMeshes[1]
						this.scene.beginAnimation(guiRect, 0, 10, false);
						isOpenGuiWrap = !isOpenGuiWrap;
					}else{
						this.camera.lockedTarget = '';
						this.setDefultCamera();
						this.scene.beginAnimation(guiRect, 10, 0, false);
						isOpenGuiWrap = !isOpenGuiWrap;
					}
				})
			);
		}
		museum.onError = (obj: any, message: any, exception: any) => {
            console.log(obj, message, exception);
        }

		let marineLife : any = loader.addMeshTask("marineLife", "", this.projectPath+"view\\model\\", "marine_life.glb");
		marineLife.onSuccess = () => {
			marineLife.loadedMeshes[0].position.x = 0; 
			marineLife.loadedMeshes[0].position.y = -10; 
			marineLife.loadedMeshes[0].position.z = -20;
			this.camera.lockedTarget = marineLife.loadedMeshes[2]
		}
		marineLife.onError = (obj: any, message: any, exception: any) => {
            console.log(obj, message, exception);
        }

		let atlantic : any = loader.addMeshTask("atlantic", "", this.projectPath+"view\\model\\", "atlantic_sturgeon.glb");
		atlantic.onSuccess = () => {
			let sturgeonAnimationPosisionZ = new Animation("tutoAnimation", "position.z", 3, Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE);
			//undefined
			let zMaxValue = 0;
			let zAddVal = 40;
			let posisionZ : Array<IAnimationKey> = [];
			let posisionX = [];
			
			posisionZ.push({frame:0, value:0})
			posisionZ.push(...[1,2,3,4,5,6,7,8,9,10].map(frm=>{
				zMaxValue = frm * zAddVal;
				return {frame : frm * 10, value : zMaxValue};
			}));
			sturgeonAnimationPosisionZ.setKeys(posisionZ);
			atlantic.loadedMeshes[0].animations.push(sturgeonAnimationPosisionZ);
			this.scene.beginAnimation(atlantic.loadedMeshes[0],  0, 200, true, 1);
			
			atlantic.loadedMeshes[1].actionManager = new ActionManager(this.scene);
			atlantic.loadedMeshes[1].actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
				if(this.isFollowCam == false){
					this.camera.lockedTarget = atlantic.loadedMeshes[1] ;
					this.isFollowCam = ! this.isFollowCam;
				}else{
					this.camera.lockedTarget = undefined;
					this.setDefultCamera();
					this.isFollowCam = ! this.isFollowCam;
				}
			}));
			atlantic.loadedMeshes.forEach((meshe: { position: { z: number; }; })=>{
				meshe.position.z = -0.5;
			})
		}
		atlantic.onError = (obj: any, message: any, exception: any) => {
            console.log(obj, message, exception);
        }
		
		SceneLoader.ImportMeshAsync(null, this.projectPath+"view\\model\\", "fish.glb").then(fishs=>{
			console.log(fishs);
		})

		loader.loadAsync();
		//this.scene.enablePhysics();
		const xrPromise = this.scene.createDefaultXRExperienceAsync({
		});
		return xrPromise.then((xrExperience) => {
			console.log("Done, WebXR is enabled.");
			return this.scene;
		});
	}
	setDefultCamera(){
		this.camera.x = -47.8774;
		this.camera.y = 41.8426;
		this.camera.z = 21.137114;
		this.camera.beta = 1.289062431626049;
		this.camera.alpha = -9.4728763141085;
		this.camera.radius = 75.07074702067573;
    }
	run3Dview(){
		this.view3DCreate().then((scene : Scene) => {
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
			this.view3DCreate().then((scene : Scene) => {
				this.engine.runRenderLoop(() => scene.render());
				this.canvas.setAttribute('is_canvas_run', 'Y')
			});
		}
	}
}
const temp3DHandler = new Temp3DHandler();
