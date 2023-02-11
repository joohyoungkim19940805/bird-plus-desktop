import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import 'babylonjs-loaders'
class Temp3DHandler {
	private canvas : HTMLCanvasElement; 
	private scene : BABYLON.Scene;
	private camera : any;
	private engine : BABYLON.Engine;
	//private fishObj : BABYLON.ISceneLoaderAsyncResult;
	private isFollowCam : Boolean = false;

	constructor(){
		this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
		this.engine = new BABYLON.Engine(this.canvas, true);
	}

	view3DCreate() {
		//공간 선언
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.autoClear = false
		//공간 배경 색상 설정
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

		//카메라의 3차원 위치 설정
		const alpha =  Math.PI/-2;
		const beta = Math.PI/3; 
		const radius = 17;
		const target = new BABYLON.Vector3(0, 5, 5);
		//카메라의 초기 위치 셋팅
		this.camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, this.scene);
		this.camera.attachControl(this.canvas, true);
		this.camera.setTarget(BABYLON.Vector3.Zero());
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
		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
		const loader = new BABYLON.AssetsManager(this.scene);
		//let cannon = true;
		//let forceFactor = cannon ? 1 : 1500; 
		let sharks : any = loader.addMeshTask("sharks", "", "./../static/model/", "waltz_of_the_sharks.glb");
		sharks.onSuccess = () => {
			console.log(sharks)
			sharks.loadedMeshes[0].position.x = 120;
		}
		sharks.onError = function (obj: any, message: any, exception: any) {
            console.log(obj, message, exception);
        }

		let museum : any = loader.addMeshTask("sharks", "", "./../static/model/", "waltz_of_the_sharks.glb");
		museum.onSuccess = () => {
			console.log(museum)
			museum.loadedMeshes[0].position.x = 110;
			museum.loadedMeshes[0].position.y = -15;
			museum.loadedMeshes[0].position.z = 15;
			let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
			advancedTexture.useInvalidateRectOptimization = false;

			let guiRect = Object.assign( new GUI.Rectangle(),{
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
			let hoverText = Object.assign( new GUI.TextBlock(), {
				color : "White",
				fontSize : 45,
				textWrapping : true,
				textVerticalAlignment : GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
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

			let guiScaleXAnimation = new BABYLON.Animation("guiScaleXAnimation", "scaleX", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
			let guiScaleYAnimation = new BABYLON.Animation("guiScaleYAnimation", "scaleY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
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
			museum.loadedMeshes[1].actionManager = new BABYLON.ActionManager(this.scene);
			let isOpenGuiWrap = false;
			museum.loadedMeshes[1].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(ev){
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
		museum.onError = function (obj: any, message: any, exception: any) {
            console.log(obj, message, exception);
        }

		let marineLife : any = loader.addMeshTask("marineLife", "", "./../static/model/", "marine_life.glb");
		marineLife.onSuccess = () => {
			marineLife.loadedMeshes[0].position.x = 0; 
			marineLife.loadedMeshes[0].position.y = -10; 
			marineLife.loadedMeshes[0].position.z = -20;
			this.camera.lockedTarget = marineLife.loadedMeshes[2]
		}
		marineLife.onError = function (obj: any, message: any, exception: any) {
            console.log(obj, message, exception);
        }

		let atlantic : any = loader.addMeshTask("atlantic", "", "./../static/model/", "atlantic_sturgeon.glb");
		atlantic.onSuccess = () => {
			let sturgeonAnimationPosisionZ = new BABYLON.Animation("tutoAnimation", "position.z", 3, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			//undefined
			let zMaxValue = 0;
			let zAddVal = 40;
			let posisionZ : Array<BABYLON.IAnimationKey> = [];
			let posisionX = [];
			
			posisionZ.push({frame:0, value:0})
			posisionZ.push(...[1,2,3,4,5,6,7,8,9,10].map(frm=>{
				zMaxValue = frm * zAddVal;
				return {frame : frm * 10, value : zMaxValue};
			}));
			sturgeonAnimationPosisionZ.setKeys(posisionZ);
			atlantic.loadedMeshes[0].animations.push(sturgeonAnimationPosisionZ);
			this.scene.beginAnimation(atlantic.loadedMeshes[0],  0, 200, true, 1);
			
			atlantic.loadedMeshes[1].actionManager = new BABYLON.ActionManager(this.scene);
			atlantic.loadedMeshes[1].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev)=>{
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
		atlantic.onError = function (obj: any, message: any, exception: any) {
            console.log(obj, message, exception);
        }

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
        this.camera.x = '-47.8774';
        this.camera.y = '41.8426';
        this.camera.z = '21.137114';
		this.camera.beta = '1.289062431626049';
        this.camera.alpha = '-9.4728763141085';
        this.camera.radius = '75.07074702067573';
    }
}
const temp3DHandler = new Temp3DHandler();
temp3DHandler.view3DCreate();
