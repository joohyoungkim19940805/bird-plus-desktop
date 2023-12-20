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
import common from '@root/js/common'; 
import { ISceneLoaderProgressEvent } from 'babylonjs';
//import * as BABYLON from 'babylonjs'
//import * as GUI from 'babylonjs-gui'
/// <reference path="https://preview.babylonjs.com/babylonjs.d.ts"/>
/// <reference path="https://preview.babylonjs.com/loaders/babylonjs.loaders.d.ts"/>
//import 'babylonjs-loaders'

import HeaderDefault from "@component/header/HeaderDefault"

window.customElements.define('header-default', HeaderDefault);
new class Workspace3DPageRenderer{
    private canvas : HTMLCanvasElement; 
	private scene : Scene;
	private camera : any;
	private engine : Engine;
    private loader : AssetsManager;
    private light : HemisphericLight;
	//private fishObj : BABYLON.ISceneLoaderAsyncResult;
	private isFollowCam : Boolean = false;

	private projectPath : Promise<String>;

	constructor(){
		this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		//공간 선언/
		this.scene = new Scene(this.engine);
		this.light = new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);
		this.loader = new AssetsManager(this.scene);
		//카메라의 3차원 위치 설정
		this.camera = new ArcRotateCamera("Camera", Math.PI/-2, Math.PI/3, 17, new Vector3(0, 5, 5), this.scene);
        
        this.camera.attachControl(this.canvas, true);
		this.camera.setTarget(Vector3.Zero());
		this.camera.speed = 0.5;
		this.camera.wheelDeltaPercentage = 0.01;
        this.camera.maxCameraSpeed = 5;

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
            console.log(result)
            this.loader.loadAsync();
        })
        this.loadDeskLamp().then((result)=>{
            console.log(result)
            this.loader.loadAsync();
        })
        this.loadComputerTable().then((result)=>{
            console.log(result)
            this.loader.loadAsync();
        })
        this.loadLowPolyFan().then((result)=>{
            console.log(result)
            this.loader.loadAsync();
        })
        this.loader.loadAsync();
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