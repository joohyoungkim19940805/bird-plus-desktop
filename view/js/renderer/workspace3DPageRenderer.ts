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
	Control,
	InputText,
	StackPanel,
	Button,
	StackPanel3D,
	InputPassword
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
		this.light = new HemisphericLight("light", new Vector3(- 5, 1, 6), this.scene);
		this.light.intensity = 0.5;
		this.loader = new AssetsManager(this.scene);
		this.loader.useDefaultLoadingScreen = false;
		//카메라의 3차원 위치 설정
		this.camera = new ArcRotateCamera("Camera", this.alpha, this.beta, this.radius, new Vector3(this.x, this.y, this.z), this.scene);
        this.camera.upperAlphaLimit = 2.5;
		this.camera.lowerAlphaLimit = 0.85;
		this.camera.upperBetaLimit = 2;
		this.camera.lowerBetaLimit = 0.5;
		this.camera.upperRadiusLimit = this.radius;
		this.camera.lowerRadiusLimit = this.radius - 3;
		this.camera.panningDistanceLimit = 5
        this.camera.attachControl(this.canvas, true);
		this.camera.onViewMatrixChangedObservable.add(()=>{
			/*console.log('alpha',this.camera.alpha);
			console.log('beta',this.camera.beta);
			console.log('radius', this.camera.radius);
			console.log('position', this.camera.position)*/
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

        this.loadChair().then((result)=>{
            console.log('loadChair',result)
        })
        this.loadDeskLamp().then((result)=>{
			console.log('loadDeskLamp',result)
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

        })
        this.loadComputerTable().then( async (result)=>{
            console.log('loadComputerTable',result)
			let meshObejects = result.meshes.reduce<Record<string, Mesh>>((t,e)=>{
				t[e.id] = e as Mesh;
				return t;
			}, {});
			console.log(meshObejects);
			let monitorPanel = meshObejects['monitor_panel'];
			monitorPanel.setVerticesData("uv",
				(monitorPanel.getVerticesData("uv") || []).map((v, idx) => idx % 2 ? 1 - v : v)
			);
			//monitorPanel.dispose();
			let monitor = meshObejects['monitor'];
			let monitorLeg = meshObejects['monitor_leg']
			let isMonitorLocked = false;
			monitor.actionManager = new ActionManager(this.scene);
			monitorLeg.actionManager = monitor.actionManager;
			monitor.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
				isMonitorLocked = ! isMonitorLocked;
				if(isMonitorLocked){
					//this.camera.lockedTarget = monitor;
					//this.camera.position.x = -0.28481291122588187, this.camera.position.y = 3.0224763293062993, this.camera.position.z = 0.9005508063391839;
					this.camera.target = new Vector3(-0.28481291122588187, 3.0224763293062993, 0.9005508063391839);
					this.camera.radius = 0.024515189826188433, this.camera.alpha =  1.582462451421408, this.camera.beta = 1.5011847180477238;
					
				}else{
					this.camera.target = new Vector3(this.x, this.y, this.z);
					this.camera.radius = this.radius, this.camera.alpha = this.alpha, this.camera.beta = this.beta
				}
			}));
			//monitorPanel.rotation = new Vector3();
			//monitor.position = new Vector3();
			
			let {isLogin} = await (window as any).myAPI.isLogin();
			if( ! isLogin){
				this.createLoginPage(monitorPanel);
			}
        })
        this.loadLowPolyFan().then((result)=>{
            console.log('loadLowPolyFan',result)
			let meshObejects = result.meshes.reduce<Record<string, Mesh>>((t,e)=>{
				t[e.id] = e as Mesh;
				return t;
			}, {});
			//let fanButton = meshObejects['motor area.003'];

			let rotaionSpeed = 100
			//let motor = meshObejects['motor_area_and_fan_primitive0'];
			const moveFanFunction = (fan : Mesh | AbstractMesh) =>{
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
			let motorList = result.meshes.filter(e=>e.id.includes('motor_area_and_fan'));//[meshObejects['motor_area_and_fan_primitive0'], meshObejects['motor_area_and_fan_primitive1']];
			let animationList = motorList.map(e=>{
				let anima = moveFanFunction(e);
				anima.stop();
				return anima;
			}) 
			let net =  meshObejects['leg'];
			let isMotorStart = false;
			net.actionManager = new ActionManager(this.scene);
			net.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (ev)=>{
				isMotorStart = ! isMotorStart;
				motorList.forEach((motor,i)=>{
					if(isMotorStart){
						animationList[i] = moveFanFunction(motor);
					}else{//animatables
						animationList[i].stop();
						motor.animations = [];
					}
				})
			}));
			
        })

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

	createLoginPage(monitorPanel : Mesh | AbstractMesh, loginSuccessCallback : Function = ()=>{}){

		//monitorPanel.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
		let texture = AdvancedDynamicTexture.CreateForMesh(monitorPanel, 1000, 1000, true, true);
		//texture.invertZ = true;
		//texture.background = 'red'
		//let texture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
		//let panel = new StackPanel();
		// /texture.addControl(panel);
		//let texture = AdvancedDynamicTexture.CreateForMeshTexture(monitor, 2048, 2048, true, false)
		//monitorPanel.position.y = 15
		console.log(monitorPanel);
		let idInput = new InputText();
		let pwInput = new InputPassword();
		let loginButton = Button.CreateSimpleButton('signIn', 'Login');
		let signUpButton = Button.CreateSimpleButton('signUp', 'Sign Up')
		
		idInput.placeholderText = 'Please Enter Your ID';
		idInput.placeholderColor = '#d5d2cab0';
		pwInput.placeholderText = 'Please Enter Your PW';
		pwInput.placeholderColor = '#d5d2cab0';
		let isIdInputFocus = false;
		let isPwInputFocus = false;
			
		[idInput, pwInput].forEach((input, i)=>{
			input.zIndex = 9999
			input.autoStretchWidth = true;
			input.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
			input.top = i == 0 ? '40px' : '110px', input.left = -30
			input.width = 0.18, input.maxWidth = 0.18
			input.height = '40px', input.fontSize = 16, input.color = 'white';;
			//input.color = "white", input.background = 'green';
			input.onFocusObservable.add((ev) => {
				//if(input == pwInput) input.text = '';
				this.camera.detachControl();
				isIdInputFocus = input == idInput;
				isPwInputFocus = input == pwInput;
			});
			let isTab = false;
			input.onBlurObservable.add(() => {
				isIdInputFocus = input == idInput ? false : isIdInputFocus;
				isPwInputFocus = input == pwInput ? false : isPwInputFocus;
				if(! isIdInputFocus && ! isPwInputFocus){
					this.camera.attachControl(this.canvas, true);
				};
				if(! isTab){
					return;
				}
				if(input == idInput) pwInput.focus();
				else idInput.focus()
				isTab = false;
			});
	
			input.onKeyboardEventProcessedObservable.add((ev) => {
				console.log(ev);
				if(ev.key == 'Tab'){
					isTab = true;
					//if(input == idInput) pwInput.focus();
					//else idInput.focus()
					return;
				}else if(ev.key == 'Enter'){
					loginButton.onPointerClickObservable.observers.forEach(e=>{
						(e as any).callback();
					})
				}
				isTab = false;
			})
			input.onBeforeKeyAddObservable.add(ev=>{
				console.log(222)

			})
			//texture.addControl
			texture.addControl(input);
		})
		
		loginButton.width = 0.05, loginButton.color = 'white', loginButton.thickness = 0;
		loginButton.height = '80px', loginButton.hoverCursor = 'pointer', loginButton.fontWeight = '10px';
		loginButton.cornerRadius = 6, loginButton.paddingTop = 3, loginButton.paddingBottom = 3, loginButton.background = '#5f5f5fd1';
		loginButton.fontSize = 14, loginButton.top = '75px', loginButton.left = 95;
		texture.addControl(loginButton);
		loginButton.onPointerClickObservable.add(() => {
			let id = idInput.text;
			let password = pwInput.text;
			let statusTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
			let statusPanel = new StackPanel();
			statusPanel.background = '#5f5f5fd1'; //statusPanel.color = '#5f5f5fd1';
			statusPanel.width = '300px', statusPanel.hoverCursor = 'pointer'
			statusPanel.onPointerClickObservable.add(()=>statusPanel.dispose());
			let statusText = new TextBlock();
			statusText.width = '300px', statusText.height = '40px', statusText.color = 'white';
			//statusText.hoverCursor = 'pointer', statusText.zIndex = 9;
			console.log(id, password);
			(window as any).myAPI.account.loginProcessing({accountName: id, password}).then(response=>{
				console.log('response',response);
				let {code} = response;
				if(code == 0){
					//(window as any).myAPI.pageChange.changeWokrspacePage();
					if(loginSuccessCallback) loginSuccessCallback();
				}else if(code == 101){
					statusText.text = '해당 기능에 권한이 없습니다.'
				}else if(code == 102){
					statusText.text = '계정 정보가 잘못되었습니다.'
				}else if(code == 103){
					statusText.text = '계정 정보가 잘못되었습니다.'
				}else if(code == 104){
					statusText.text = '비활성화 된 계정입니다.'
				}else if(code == 999){
					statusText.text = '알 수 없는 오류입니다. 관리자에게 문의하십시오.';
				}else{
					statusText.text = '서버로부터 응답이 없습니다.';
				}
				statusPanel.addControl(statusText)
				statusTexture.addControl(statusPanel);
				setTimeout(()=>{
					statusPanel.removeControl(statusText);
					statusTexture.removeControl(statusPanel);
					statusText.dispose();
					statusPanel.dispose();
					statusTexture.dispose();
				}, 1500)
			});
		})
		
		signUpButton.width = 0.1, signUpButton.color = 'white', signUpButton.thickness = 0;
		signUpButton.height = '50px', signUpButton.hoverCursor = 'pointer', signUpButton.fontWeight = '10px';
		signUpButton.cornerRadius = 6, signUpButton.paddingTop = 3, signUpButton.paddingBottom = 3, signUpButton.background = '#5f5f5fd1'; 
		signUpButton.fontSize = 14, signUpButton.top = '200px', signUpButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
		signUpButton.onPointerClickObservable.add(() => {
			(window as any).myAPI.getServerUrl().then((url : string)=>{
				console.log(url)
				let a = Object.assign(document.createElement('a'), {
					target: '_blank',
					href: url
				});
				a.click();
			});
		})
		texture.addControl(signUpButton);
		
		
		

		//texture.addControl(idInput);
		//texture.addControl(pwInput);
		//isVisible
		
		
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