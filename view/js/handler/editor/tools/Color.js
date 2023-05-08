import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
export default class Color extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static options = new Options(this);
	//static #paletteVh = 35;
	static #paletteVw = 30; 
	static #r = 255;
	static #g = 0;
	static #b = 0;
	static #a = 1;
	static get #selectedColor(){
		return `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
	}
	static{
		this.options.extendsElement = 'kbd';
		this.options.defaultClass = 'freedom-color';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'C'
		// default tools icon
		let palette = Object.assign(document.createElement('div'),{
			className: 'palette-wrap'
		});
		document.addEventListener("scroll", () => {
			if(palette.isConnected){
				this.#processingPalettePosition(palette);
			}
		});
		palette.replaceChildren(...Object.values(this.#createPaletteItems()));
		document.head.append(this.#style())
		this.options.showTools = button;
		this.options.showTools.onclick = ()=>{
			if(this.options.showTools.dataset.tool_status == 'active' || this.options.showTools.dataset.tool_status == 'connected'){
				this.options.showTools.dataset.tool_status = 'cancel';
			}else{
				//this.options.showTools.dataset.tool_status = 'active';
				palette.replaceChildren(...Object.values(this.#createPaletteItems()));
				document.body.append(palette);
				this.#processingPalettePosition(palette);
			}
		}
	}
	
	static #createPaletteItems(){

		// 팔레트 상단 텍스트 영역
		let {topTextWrap, selectionRgbBg, previousRgbBg} = this.#rgbaTopTextWrap()
		
		// 팔레트 중단 컬러 설정 집합 영역
		let colorWrap = Object.assign(document.createElement('div'),{
			className: 'color-wrap'
		})
		colorWrap.append(this.#createColorPanel(), this.#createPaint());

		// 팔레트 색상 명도 조절 설정 캔버스 영역
		let brightnessColor = this.#createBrightnessColor()

		// 팔레트 하단 텍스트 영역
		let {bottomTextWrap, selectionRgbText, previousRgbText} = this.#rgbaBottomTextWrap();
		
		return {topTextWrap, colorWrap, brightnessColor, bottomTextWrap}; 
	}

	static #createColorPanel(){
		let colorPanel = Object.assign(document.createElement('canvas'),{
			className: 'palette-panel'
		})
		let context = colorPanel.getContext('2d');

		// 가로 그라데이션
		let gradientH = context.createLinearGradient(0, 0, context.canvas.width, 0);
		gradientH.addColorStop(0, 'white');
		gradientH.addColorStop(1, this.#selectedColor);
		context.fillStyle = gradientH;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		// 수직 그라데이션
		let gradientV = context.createLinearGradient(0, 0, 0, context.canvas.height);
		gradientV.addColorStop(0, 'rgba(0,0,0,0)');
		gradientV.addColorStop(1,  'black');
		context.fillStyle = gradientV;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);



		return colorPanel;
	}

	static #createPaint(){
		let paint = Object.assign(document.createElement('canvas'),{
			className: 'palette-paint'
		});
		let context = paint.getContext('2d');
		let gradient = context.createLinearGradient(0,0,0,context.canvas.height); 
		gradient.addColorStop(0, 'rgb(255, 0, 0)') // red
		gradient.addColorStop(0.15, 'rgb(255, 0, 255)') // violet
		gradient.addColorStop(0.35, 'rgb(0, 0, 255)') // blue
		gradient.addColorStop(0.45, 'rgb(0, 255, 255)') // Sky blue
		gradient.addColorStop(0.65, 'rgb(0, 255, 0)') // green
		gradient.addColorStop(0.85, 'rgb(255, 255, 0)') // yellow
		gradient.addColorStop(0.9, 'orange')
		gradient.addColorStop(1, 'rgb(255, 0, 0)') // red
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		return paint;
	}

	static #createBrightnessColor(){
		let brightnessWrap = Object.assign(document.createElement('div'), {
			className: 'brightness-wrap'
		});
		let brightnessColor = Object.assign(document.createElement('canvas'), {
			className: 'brightness-color'
		})
		brightnessWrap.append(brightnessColor)
		let context = brightnessColor.getContext('2d');
		let gradient = context.createLinearGradient(0, 0, context.canvas.width, 0) 
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, this.#selectedColor);
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		
		return brightnessWrap;
	}

	static #rgbaTopTextWrap(){
		let topTextWrap = Object.assign(document.createElement('div'), {
			className: 'top-text-wrap'
		});
		
		let selectionRgbBg = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-bg',
			textContent: this.#selectedColor
		});
		selectionRgbBg.style.background = this.#selectedColor;

		let previousRgbBg = Object.assign(document.createElement('div'), {
			className : 'previous-rgb-bg',
		});
		previousRgbBg.style.background = this.#selectedColor;

		topTextWrap.append(selectionRgbBg, previousRgbBg)

		return {topTextWrap, selectionRgbBg, previousRgbBg}
	}

	static #rgbaBottomTextWrap(){
		let bottomTextWrap = Object.assign(document.createElement('div'), {
			className: 'bottom-text-wrap'
		});
		let selection = window.getSelection();
		let sampleText = '';
		if(selection.rangeCount != 0){
			sampleText = window.getSelection().getRangeAt(0).toString();
		}
		sampleText = sampleText == '' ? '가 나다 라 A BC D' : sampleText;
		let selectionRgbText = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-text',
			textContent: sampleText
		});
		selectionRgbText.style.color = this.#selectedColor;
		
		let previousRgbText = Object.assign(document.createElement('div'), {
			className: 'previous-rgb-text',
			textContent: sampleText
		});
		previousRgbText.style.color = this.#selectedColor;

		let buttonWrap = Object.assign(document.createElement('div'),{
			className: 'button-wrap'
		})
		let cancelButton = Object.assign(document.createElement('button'), {
			className: 'cancel-button',
			type: 'button',
			textContent: 'cancel'
		})
		let applyButton = Object.assign(document.createElement('button'), {
			className: 'apply-button',
			type: 'button',
			textcontent: 'apply'
		})
		bottomTextWrap.append(selectionRgbText, previousRgbText)

		return {bottomTextWrap, selectionRgbText, previousRgbText}
	}

	static #processingPalettePosition(palette){
		let {x, y, height} = this.options.showTools.getBoundingClientRect();
		//let paletteWidthPx = document.documentElement.clientHeight * (this.#paletteVw / 100);
		//let paletteHeightPx = document.documentElement.clientHeight * (this.#paletteVh / 100);
		let paletteHeightPx = palette.clientHeight;
		let paletteTop = (y - paletteHeightPx)
		if(paletteTop > 0){
			palette.style.top = paletteTop + 'px';
		}else{
			palette.style.top = y + height + 'px';
		}
		palette.style.left = x + 'px';

	}

	static #style(){
		let style = document.createElement('style');
		style.innerHTML = `
			.palette-wrap{
				background: #000000bf;
				position: fixed;
				padding: 0.9%;
				width: ${this.#paletteVw}vw;
				height: fit-content;
				color: white;
    			font-size: 13px;
			}

			.top-text-wrap{
				display: flex;
    			justify-content: space-between;
				margin-bottom: 2%;
				height: 8%;
			}
			.top-text-wrap .selection-rgb-bg{
				width: 100%;
				text-align-last: center;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.top-text-wrap .previous-rgb-bg{
				text-align-last: center;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 11.5%;
			}

			.color-wrap{
				display: flex;
				justify-content: space-between;
				margin-bottom: 2%;
			}
			.color-wrap .palette-panel{
				width: 90%;
			}
			.color-wrap .palette-paint{
				width: 5%;
			}

			.brightness-wrap{
				margin-bottom: 2%;
				background-image: /* tint image */ linear-gradient(to right, rgb(192 192 192 / 20%), rgb(192 192 192 / 20%)), /* checkered effect */ linear-gradient(to right, #505050 50%, #a1a1a1 50%), linear-gradient(to bottom, #505050 50%, #a1a1a1 50%);
				background-blend-mode: normal, difference, normal;
				background-size: 2em 2em;
				display: flex;
			}
			.brightness-wrap .brightness-color{
				height: 3vh;
    			width: 100%;
			}

			.bottom-text-wrap{
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.bottom-text-wrap .selection-rgb-text{
				background: white;
			}
			.bottom-text-wrap .previous-rgb-text{
				background: white;
			}
		`;
		return style;
	}

	#isLoaded = false;
	constructor(){
		super(Color);
		this.style.color = 'red';
	}
		
}