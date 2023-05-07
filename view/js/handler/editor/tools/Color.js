import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
export default class Color extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static options = new Options(this);
	static #paletteVh = 35;
	static #paletteVw = 30; 
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
		let gradient = context.createLinearGradient(0,0,300,0) 

		return colorPanel;
	}

	static #createPaint(){
		let paint = Object.assign(document.createElement('canvas'),{
			className: 'palette-paint'
		});
		let context = paint.getContext('2d');
		let gradient = context.createLinearGradient(0,0,0,150) 
		gradient.addColorStop(0, 'red')
		gradient.addColorStop(0.15, 'violet')
		gradient.addColorStop(0.35, 'blue')
		gradient.addColorStop(0.45, 'rgb(0, 255, 255)')
		gradient.addColorStop(0.65, 'green')
		gradient.addColorStop(0.85, 'yellow')
		gradient.addColorStop(0.9, 'orange')
		gradient.addColorStop(1, 'red')
		context.fillStyle = gradient;
		context.fillRect(0,0,200,150);
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
		let gradient = context.createLinearGradient(0,0,0,150) 
		return brightnessWrap;
	}

	static #rgbaTopTextWrap(){
		let topTextWrap = Object.assign(document.createElement('div'), {
			className: 'top-text-wrap'
		});

		let selectionRgbBg = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-bg'
		});
		
		let previousRgbBg = Object.assign(document.createElement('div'), {
			className : 'previous-rgb-bg'
		});
		topTextWrap.append(selectionRgbBg, previousRgbBg)

		return {topTextWrap, selectionRgbBg, previousRgbBg}
	}

	static #rgbaBottomTextWrap(){
		let bottomTextWrap = Object.assign(document.createElement('div'), {
			className: 'bottom-text-wrap'
		});
		let sampleText = window.getSelection().getRangeAt(0).toString();
		sampleText = sampleText == '' ? '가 나다 라 A BC D' : sampleText;
		let selectionRgbText = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-text',
			textContent: sampleText
		});
		
		let previousRgbText = Object.assign(document.createElement('div'), {
			className: 'previous-rgb-text',
			textContent: sampleText
		});

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
		let paletteHeightPx = document.documentElement.clientHeight * (this.#paletteVh / 100);

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
				background: #688299;
				position: fixed;
				padding: 0.9%;
				width: ${this.#paletteVw}vw;
				height: ${this.#paletteVh}vh;
			}
			.top-text-wrap{
				display: flex;
    			justify-content: space-between;
			}

			.color-wrap{
				display: flex;
				justify-content: space-between;
			}
			.palette-paint{
				width: 35px;
				height: 180px;
			}
			.brightness-color{
				height: 3vh;
    			width: 100%;
			}
			.bottom-text-wrap{
				display: flex;
				justify-content: space-between;
			}
			.selection-rgb-text{
				width: 60%;
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