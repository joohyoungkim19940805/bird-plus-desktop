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
	SpotLight,
	PointerEventTypes
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
	InputPassword,
	ScrollViewer,
	Container,
	TextWrapping
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

	private isMouseDown = false;
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
		this.scene.onPointerObservable.add((ev) => {
			if(ev.type == PointerEventTypes.POINTERDOWN){
				this.isMouseDown = true;
			}else if(ev.type == PointerEventTypes.POINTERUP){
				this.isMouseDown = false;
			}
		})
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
			let monitorPanelTexture = AdvancedDynamicTexture.CreateForMesh(monitorPanel, undefined, undefined, true, true);
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
				this.camera.attachControl(this.canvas, true);
			}));
			//monitorPanel.rotation = new Vector3();
			//monitor.position = new Vector3();
			
			let {isLogin} = await (window as any).myAPI.isLogin();
			if( ! isLogin){
				this.createLoginPage(monitorPanelTexture, (components : Record<string, InputText | InputPassword | Button>) => {
					let {idInput, pwInput, loginButton, signUpButton} = components;
					monitorPanelTexture.removeControl(idInput), monitorPanelTexture.removeControl(pwInput);
					monitorPanelTexture.removeControl(loginButton), monitorPanelTexture.removeControl(signUpButton);
					[idInput, pwInput, loginButton, signUpButton].forEach(e=>{
						monitorPanelTexture.removeControl(e);
						e.dispose()
					})
					this.createWorkspaceMyJoinedListPage(monitorPanelTexture);
				});
			}else{
				this.createWorkspaceMyJoinedListPage(monitorPanelTexture);
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

	createLoginPage(texture : AdvancedDynamicTexture, loginSuccessCallback : Function = ()=>{}){
		let idInput = new InputText();
		let pwInput = new InputPassword();
		let loginButton = Button.CreateSimpleButton('signIn', 'Login');
		let signUpButton = Button.CreateSimpleButton('signUp', 'Sign Up')
		let components : Record<string, InputText | InputPassword | Button> = {idInput, pwInput, loginButton, signUpButton} ;
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
			input.height = '40px', input.fontSize = 16, input.color = 'white';
			//input.color = "white", input.background = 'green';
			input.onFocusObservable.add((ev) => {
				//if(input == pwInput) input.text = '';
				this.camera.detachControl();
				isIdInputFocus = input == idInput;
				isPwInputFocus = input == pwInput;
			});
			input.onBlurObservable.add(() => {
				isIdInputFocus = input == idInput ? false : isIdInputFocus;
				isPwInputFocus = input == pwInput ? false : isPwInputFocus;
				if(! isIdInputFocus && ! isPwInputFocus){
					this.camera.attachControl(this.canvas, true);
				};
			});
	
			input.onKeyboardEventProcessedObservable.add((ev) => {
				console.log(ev);
				if(ev.key == 'Tab'){
					ev.preventDefault();
					if(input == idInput) pwInput.focus();
					else idInput.focus()
					return;
				}else if(ev.key == 'Enter'){
					loginButton.onPointerClickObservable.observers.forEach( e => {
						(e as any).callback();
					})
				}else if(ev.ctrlKey && ev.key == 'Backspace'){
					input.text = '';
				}
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
					if(loginSuccessCallback) loginSuccessCallback(components);
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

		return components
	}

	createWorkspaceMyJoinedListPage(texture : AdvancedDynamicTexture){
		let page = 0, size = 10, totalElementsCount = 0, componentList : Array<Record<string, Rectangle | TextBlock>> = [];
		let isContainerEnter = false, isItemEnter = false, isScrollViewEnter = false;

		let pageLabel = new TextBlock('pageLabel');
		pageLabel.paddingLeft = '10px', pageLabel.text = 'My Joined Workspaces', pageLabel.color = '#838383e0', pageLabel.fontSize = '15px' 
		pageLabel.top = '15px', pageLabel.left = '-30px', pageLabel.fontWeight = '14px'
		texture.addControl(pageLabel)

		let topPanel = new Rectangle('topPanel');
		topPanel.top = '120px', topPanel.thickness = 0.3
		topPanel.width = 0.26, topPanel.height = 0.16;
		texture.addControl(topPanel);

		let scrollView = new ScrollViewer('workspaceListScrollView');
		scrollView.width = '100%', scrollView.height = '100%';
		scrollView.barSize = 15, scrollView.thickness = 0, scrollView.verticalBar.color = 'white';
		scrollView.verticalBar.onPointerDownObservable.add(ev=>{
			//console.log(ev);
			this.camera.detachControl();
		});
		scrollView.verticalBar.onPointerUpObservable.add(ev=>{
			//console.log(ev);
			this.camera.attachControl(this.canvas, true);
		});
		scrollView.verticalBar.onPointerEnterObservable.add(ev=>{
			isScrollViewEnter = true;
			if(this.isMouseDown) return;
			if(isContainerEnter || isItemEnter || isScrollViewEnter){
				this.camera.detachControl();
			}
			//console.log('scroll enter', isContainerEnter, isItemEnter, isScrollViewEnter);
		});
		scrollView.verticalBar.onPointerOutObservable.add(ev=>{
			isScrollViewEnter = false;
			if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
				this.camera.attachControl(this.canvas, true);
			}
			//console.log('scroll out', isContainerEnter, isItemEnter, isScrollViewEnter);
			//this.camera.attachControl(this.canvas, true);
		});
		scrollView.onBeforeDrawObservable.add(ev=>{
			if(
				scrollView.verticalBar.value != scrollView.verticalBar.maximum ||
				componentList.length >= totalElementsCount
			){
				return;
			}
			scrollView.verticalBar.value = componentList.length / ( (page + 2) * size )
			page += 1;
			(window as any).myAPI.workspace.searchWorkspaceMyJoined({page, size}).then((result : any = {}) => {
				console.log(result);
				//container.height = result.data.totalElements * itemHeight;
				let list : Array<WorkspaceListType> = result.data.content;
				componentList.push(
					...list.map((item, i) => createItem(item, i))
				);
			})
		
		});
		topPanel.addControl(scrollView);
		
		let container = new StackPanel('workspaceListContainer');
		container.color = "red", container.alpha = 0.65;
		container.onPointerEnterObservable.add(ev=>{
			isContainerEnter = true;
			if(this.isMouseDown) return;
			if(isContainerEnter || isItemEnter || isScrollViewEnter){
				this.camera.detachControl();	
			}
			//console.log('container enter',isContainerEnter, isItemEnter, isScrollViewEnter);
		})
		container.onPointerOutObservable.add(ev=>{
			isContainerEnter = false;
			if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
				this.camera.attachControl(this.canvas, true);
			}
			//console.log('container out',isContainerEnter, isItemEnter, isScrollViewEnter);
		});
		scrollView.addControl(container);

		let makeWorkspaceButton = Button.CreateSimpleButton('makeWorkspaceButton', 'Create New Workspace');
		makeWorkspaceButton.top = '235px', makeWorkspaceButton.left = '-65px'
		makeWorkspaceButton.width = '100px', makeWorkspaceButton.height = '35px', makeWorkspaceButton.fontSize = '11px';
		makeWorkspaceButton.paddingLeft = '10px', makeWorkspaceButton.background = '#5f5f5fd1', makeWorkspaceButton.color = 'white';
		makeWorkspaceButton.hoverCursor = 'pointer'
		texture.addControl(makeWorkspaceButton);
		
		let searchWorkspaceButton = Button.CreateSimpleButton('searchWorkspaceButton', 'Search Workspace');
		searchWorkspaceButton.top = '235px', searchWorkspaceButton.left = '55px'
		searchWorkspaceButton.width = '100px', searchWorkspaceButton.height = '35px', searchWorkspaceButton.fontSize = '11px';
		searchWorkspaceButton.paddingLeft = '10px', searchWorkspaceButton.background = '#5f5f5fd1', searchWorkspaceButton.color = 'white';
		searchWorkspaceButton.hoverCursor = 'pointer'
		searchWorkspaceButton.onPointerClickObservable.add(ev=> {
			[
				pageLabel, ...componentList.flatMap(e=>[e.workspaceName, e.workspaceJoinedCount, e.itemPanel]), 
				container, scrollView, makeWorkspaceButton, searchWorkspaceButton
			].forEach(e=>{
				texture.removeControl(e);
				e.dispose();
			});
			this.createSearchAntherWorkspacePage(texture);
		})
		texture.addControl(searchWorkspaceButton);
		
		interface WorkspaceListType{
			accessFilter: Array<string>,
			isEnabled: boolean,
			isFinallyPermit: boolean,
			joinedCount: number,
			workspaceId: number,
			workspaceName: string
		}

		const createItem = (item : WorkspaceListType, index: number) => {
			//let num = index + 1;
			let itemPanel = new Rectangle(`workspaceListItemPanel_${index}`);
			itemPanel.onPointerEnterObservable.add(ev=>{
				isItemEnter = true;
				if(this.isMouseDown) return;
				if(isContainerEnter || isItemEnter || isScrollViewEnter){
					this.camera.detachControl();	
				}
				//console.log('item enter ',isContainerEnter, isItemEnter, isScrollViewEnter);
			})
			itemPanel.onPointerOutObservable.add(ev=>{
				isItemEnter = false;
				if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
					this.camera.attachControl(this.canvas, true);
				}
				//console.log('item out', isContainerEnter, isItemEnter, isScrollViewEnter);
			});
			itemPanel.onPointerClickObservable.add(ev=>{
				(window as any).myAPI.resetWorkspaceId().then(()=>{
					//console.log(item.wokrpsaceId);
					(window as any).myAPI.pageChange.changeMainPage({workspaceId: item.workspaceId});
				});
			})
			itemPanel.hoverCursor = 'pointer', itemPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			//itemPanel.top = ( itemHeight * index ) + 5;
			itemPanel.left = '4px', itemPanel.width = '90%';
			itemPanel.height = '60px', itemPanel.background = "black";
			itemPanel.alpha = 0.8, itemPanel.thickness = 0.2
			//itemPanel.cornerRadius = 6;
			itemPanel.paddingTop = 6, itemPanel.paddingBottom = 6;
			container.addControl(itemPanel)

			let workspaceName = new TextBlock(`workspaceName_${index}`);
			workspaceName.textWrapping = TextWrapping.WordWrap;
			workspaceName.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			workspaceName.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceName.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			workspaceName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceName.paddingTop = '2%', workspaceName.paddingLeft = '2%';
			workspaceName.color = "white", workspaceName.fontWeight = '12px';
			workspaceName.fontSize = 16, workspaceName.text = item.workspaceName;

			let workspaceJoinedCount = new TextBlock(`workspaceJoinedCount_${index}`);
			workspaceJoinedCount.textWrapping = TextWrapping.WordWrap;
			workspaceJoinedCount.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
			workspaceJoinedCount.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceJoinedCount.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
			workspaceJoinedCount.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceJoinedCount.color = 'white', workspaceJoinedCount.paddingBottom = '2%';
			workspaceJoinedCount.paddingLeft = '2%', workspaceJoinedCount.fontSize = 12;
			workspaceJoinedCount.text = `(${item.joinedCount} members)`;
			
			itemPanel.addControl(workspaceName), itemPanel.addControl(workspaceJoinedCount)
			
			return {itemPanel, workspaceName, workspaceJoinedCount}; 
		}
		(window as any).myAPI.workspace.searchWorkspaceMyJoined({page, size}).then((result : any = {}) => {
			console.log(result);
			totalElementsCount = result.data.totalElements;
			//container.height = result.data.totalElements * itemHeight;
			let list : Array<WorkspaceListType> = result.data.content;
			componentList.push(
				...list.map((item, i) => createItem(item, i))
			);
			
		})


	}

	createSearchAntherWorkspacePage(texture : AdvancedDynamicTexture){
		let page = 0, size = 10, totalElementsCount = 0, componentList : Array<Record<string, Rectangle | TextBlock>> = [];
		let isContainerEnter = false, isItemEnter = false, isScrollViewEnter = false;

		let searchInput = new InputText('workspaceSearchInput');
		searchInput.color = 'white', searchInput.fontSize = '15px' 
		searchInput.placeholderText = 'Search Workspace Name', searchInput.placeholderColor = '#d5d2cab0';
		searchInput.top = '15px', searchInput.fontWeight = '14px'
		searchInput.width = 0.23, searchInput.maxWidth = 0.23, searchInput.height = '30px';
		searchInput.onKeyboardEventProcessedObservable.add((ev) => {
			if(ev.key == 'Enter' || (ev.ctrlKey && ev.key == 'Backspace')){
				componentList.flatMap(e=>[e.workspaceName, e.workspaceJoinedCount, e.itemPanel]).forEach(e=>{
					texture.removeControl(e);
					e.dispose();
				});
				componentList = [];
			}
			
			if(searchInput.text == '') return;

			if(ev.key == 'Enter'){
				console.log('searchInput.text', searchInput.text);
				(window as any).myAPI.workspace.searchNameSpecificList({page, size, workspaceName: searchInput.text}).then((result : any = {}) => {
					console.log(result);
					totalElementsCount = result.data.totalElements;
					let list : Array<WorkspaceListType> = result.data.content;
					componentList.push(
						...list.map((item, i) => createItem(item, i))
					);
				});
				searchInput.focus();
			}else if(ev.ctrlKey && ev.key == 'Backspace'){
				searchInput.text = '';
			}
		})
		searchInput.onFocusObservable.add((ev) => {
			//if(input == pwInput) input.text = '';
			this.camera.detachControl();
		});
		searchInput.onBlurObservable.add(() => {
			this.camera.attachControl(this.canvas, true);
		});
		texture.addControl(searchInput)
		//searchInput.focus();

		let makeWorkspaceButton = Button.CreateSimpleButton('makeWorkspaceButton', 'Create New Workspace');
		makeWorkspaceButton.top = '235px', makeWorkspaceButton.left = '-65px'
		makeWorkspaceButton.width = '100px', makeWorkspaceButton.height = '35px', makeWorkspaceButton.fontSize = '11px';
		makeWorkspaceButton.paddingLeft = '10px', makeWorkspaceButton.background = '#5f5f5fd1', makeWorkspaceButton.color = 'white';
		makeWorkspaceButton.hoverCursor = 'pointer'
		texture.addControl(makeWorkspaceButton);
		
		let searchWorkspaceButton = Button.CreateSimpleButton('searchWorkspaceButton', 'Search Workspace');
		searchWorkspaceButton.top = '235px', searchWorkspaceButton.left = '55px'
		searchWorkspaceButton.width = '100px', searchWorkspaceButton.height = '35px', searchWorkspaceButton.fontSize = '11px';
		searchWorkspaceButton.paddingLeft = '10px', searchWorkspaceButton.background = '#5f5f5fd1', searchWorkspaceButton.color = 'white';
		searchWorkspaceButton.hoverCursor = 'pointer'
		texture.addControl(searchWorkspaceButton);

		let topPanel = new Rectangle('topPanel');
		topPanel.top = '120px', topPanel.thickness = 0.3
		topPanel.width = 0.26, topPanel.height = 0.16;
		texture.addControl(topPanel);

		let scrollView = new ScrollViewer('workspaceListScrollView');
		scrollView.width = '100%', scrollView.height = '100%';
		scrollView.barSize = 15, scrollView.thickness = 0, scrollView.verticalBar.color = 'white';
		
		scrollView.verticalBar.onPointerDownObservable.add(ev=>{
			//console.log(ev);
			this.camera.detachControl();
		});
		scrollView.verticalBar.onPointerUpObservable.add(ev=>{
			//console.log(ev);
			this.camera.attachControl(this.canvas, true);
		});
		scrollView.verticalBar.onPointerEnterObservable.add(ev=>{
			isScrollViewEnter = true;
			if(this.isMouseDown) return;
			if(isContainerEnter || isItemEnter || isScrollViewEnter){
				this.camera.detachControl();
			}
			//console.log('scroll enter', isContainerEnter, isItemEnter, isScrollViewEnter);
		});
		scrollView.verticalBar.onPointerOutObservable.add(ev=>{
			isScrollViewEnter = false;
			if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
				this.camera.attachControl(this.canvas, true);
			}
			//console.log('scroll out', isContainerEnter, isItemEnter, isScrollViewEnter);
			//this.camera.attachControl(this.canvas, true);
		});
		scrollView.onBeforeDrawObservable.add(ev=>{
			if(
				scrollView.verticalBar.value != scrollView.verticalBar.maximum ||
				componentList.length >= totalElementsCount
			){
				return;
			}
			scrollView.verticalBar.value = componentList.length / ( (page + 2) * size )
			page += 1;
			(window as any).myAPI.workspace.searchNameSpecificList({page, size, workspaceName: searchInput.text}).then((result : any = {}) => {
				console.log(result);
				totalElementsCount = result.data.totalElements;
				let list : Array<WorkspaceListType> = result.data.content;
				componentList.push(
					...list.map((item, i) => createItem(item, i))
				);
			})
		
		});
		topPanel.addControl(scrollView);
		
		let container = new StackPanel('workspaceListContainer');
		container.color = "red", container.alpha = 0.65;
		container.onPointerEnterObservable.add(ev=>{
			isContainerEnter = true;
			if(this.isMouseDown) return;
			if(isContainerEnter || isItemEnter || isScrollViewEnter){
				this.camera.detachControl();	
			}
			//console.log('container enter',isContainerEnter, isItemEnter, isScrollViewEnter);
		})
		container.onPointerOutObservable.add(ev=>{
			isContainerEnter = false;
			if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
				this.camera.attachControl(this.canvas, true);
			}
			//console.log('container out',isContainerEnter, isItemEnter, isScrollViewEnter);
		});
		scrollView.addControl(container);


		interface WorkspaceListType{
			accessFilter: Array<string>,
			isEnabled: boolean,
			isFinallyPermit: boolean,
			joinedCount: number,
			id: number,
			workspaceName: string
		}

		const createItem = (item : WorkspaceListType, index: number) => {
			//let num = index + 1;
			let itemPanel = new Rectangle(`workspaceListItemPanel_${index}`);
			itemPanel.onPointerEnterObservable.add(ev=>{
				isItemEnter = true;
				if(this.isMouseDown) return;
				if(isContainerEnter || isItemEnter || isScrollViewEnter){
					this.camera.detachControl();	
				}
				//console.log('item enter ',isContainerEnter, isItemEnter, isScrollViewEnter);
			})
			itemPanel.onPointerOutObservable.add(ev=>{
				isItemEnter = false;
				if( ! isContainerEnter && ! isItemEnter && ! isScrollViewEnter){
					this.camera.attachControl(this.canvas, true);
				}
				//console.log('item out', isContainerEnter, isItemEnter, isScrollViewEnter);
			});
			
			itemPanel.hoverCursor = 'pointer', itemPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			//itemPanel.top = ( itemHeight * index ) + 5;
			itemPanel.left = '4px', itemPanel.width = '90%';
			itemPanel.height = '60px', itemPanel.background = "black";
			itemPanel.alpha = 0.8, itemPanel.thickness = 0.2
			//itemPanel.cornerRadius = 6;
			itemPanel.paddingTop = 6, itemPanel.paddingBottom = 6;
			container.addControl(itemPanel)

			let workspaceName = new TextBlock(`workspaceName_${index}`);
			//workspaceName.textWrapping = TextWrapping.WordWrap;
			workspaceName.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			workspaceName.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceName.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
			workspaceName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceName.paddingTop = '2%', workspaceName.paddingLeft = '2%';
			workspaceName.color = "white", workspaceName.fontWeight = '12px';
			workspaceName.fontSize = 16, workspaceName.text = item.workspaceName;

			let workspaceJoinedCount = new TextBlock(`workspaceJoinedCount_${index}`);
			workspaceJoinedCount.textWrapping = TextWrapping.WordWrap;
			workspaceJoinedCount.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
			workspaceJoinedCount.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceJoinedCount.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
			workspaceJoinedCount.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
			workspaceJoinedCount.color = 'white', workspaceJoinedCount.paddingBottom = '2%';
			workspaceJoinedCount.paddingLeft = '2%', workspaceJoinedCount.fontSize = 12;
			workspaceJoinedCount.text = `(${item.joinedCount} members)`;
			
			let joinRequestButton = Button.CreateSimpleButton('JoinRequest', 'Join Request');
			//joinRequestButton.top = '235px', joinRequestButton.left = '55px'
			joinRequestButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
			joinRequestButton.width = '60px', joinRequestButton.height = '40px', joinRequestButton.fontSize = '11px';
			joinRequestButton.paddingLeft = '10px', joinRequestButton.background = '#5f5f5fd1', joinRequestButton.color = 'white';
			joinRequestButton.hoverCursor = 'pointer'
			joinRequestButton.onPointerClickObservable.add(ev=>{
				(window as any).myAPI.workspace.createWorkspaceJoined({id: item.id}).then((result : any) => {
					let statusTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
					let statusPanel = new StackPanel();
					statusPanel.background = '#5f5f5fd1'; //statusPanel.color = '#5f5f5fd1';
					statusPanel.width = '100%', statusPanel.hoverCursor = 'pointer'
					statusPanel.onPointerClickObservable.add(()=>statusPanel.dispose());
					let statusText = new TextBlock();
					statusText.textWrapping = TextWrapping.WordWrap;
					statusText.width = '100%', statusText.height = '80px', statusText.color = 'white';
					console.log(result);
					if(result.code == 0){
						if( ! result.data.isEnabled){
							statusText.text = '승인 받은 사용자만 접속 가능합니다. 참여 요청이 전송되었으며, 관리자의 최종 승인을 기다리십시오.'
							statusPanel.addControl(statusText)
							statusTexture.addControl(statusPanel);
							setTimeout(()=>{
								statusPanel.removeControl(statusText);
								statusTexture.removeControl(statusPanel);
								statusText.dispose();
								statusPanel.dispose();
								statusTexture.dispose();
							}, 2500)
						}else{
							(window as any).myAPI.resetWorkspaceId().then(()=>{
							//	(window as any).myAPI.pageChange.changeMainPage({workspaceId: item.id});
							});
						}
					}else if(result.code == 203){
						(window as any).myAPI.resetWorkspaceId().then(()=>{
						//	(window as any).myAPI.pageChange.changeMainPage({workspaceId: item.id});
						});
					}
					else{
						statusText.text = result.message
						statusPanel.addControl(statusText)
						statusTexture.addControl(statusPanel);
						setTimeout(()=>{
							statusPanel.removeControl(statusText);
							statusTexture.removeControl(statusPanel);
							statusText.dispose();
							statusPanel.dispose();
							statusTexture.dispose();
						}, 1500)
					}
				});
			});

			itemPanel.addControl(workspaceName), itemPanel.addControl(workspaceJoinedCount), itemPanel.addControl(joinRequestButton);
			
			return {itemPanel, workspaceName, workspaceJoinedCount}; 
		}
 
	}

	createMakeWorkspacePage(){

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