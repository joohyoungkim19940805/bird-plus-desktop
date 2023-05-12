import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
export default class Color extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static options = new Options(this);
	//static #paletteVh = 35;
	static #paletteVw = 30; 
	static #componentMap = undefined;
	static #r = 255;
	static #g = 0;
	static #b = 0;
	static #a = 1;
	static #lastSelectPosition = undefined;
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
		//palette.replaceChildren(...Object.values(this.#createPaletteItems()));
		document.head.append(this.#style())
		this.options.showTools = button;
		this.options.showTools.onclick = ()=>{
			if(this.options.showTools.dataset.tool_status == 'active' || this.options.showTools.dataset.tool_status == 'connected'){
				this.options.showTools.dataset.tool_status = 'cancel';
			}else{
				//this.options.showTools.dataset.tool_status = 'active'
				this.#componentMap = this.#createPaletteItems();
				this.#createPalette(palette, this.#componentMap);
				this.#processingPalettePosition(palette);
			}
		}
		window.addEventListener('resize', (event) => {
			console.log('resize ::: ', event)
			this.#componentMap = this.#createPaletteItems();
			this.#createPalette(palette, this.#componentMap);
			let done = setTimeout(()=>{
				this.#processingPalettePosition(palette);
				clearTimeout(done);
				done = undefined
			},100)
		})

		window.addEventListener('mouseup', () => {
			if( ! this.#componentMap){
				return;
			}
			this.#componentMap.colorPanel?.removeAttribute('data-is_mouse_down');
		})
		window.addEventListener('mousemove', (event) => {
			if( ! this.#componentMap){
				return;
			}
			
			if(this.#componentMap.colorPanel && this.#componentMap.colorPanel.hasAttribute('data-is_mouse_down')){
				this.#colorPanelEvent(event)
			}
		})
	}

	static #createPalette(palette, itemMap){
		let {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			brightnessColorWrap, 
			bottomTextWrap, selectionRgbText, previousRgbText,
			applyWrap, cancelButton, applyButton
		} = itemMap
		palette.replaceChildren(topTextWrap, colorWrap, brightnessColorWrap, bottomTextWrap, applyWrap);
		document.body.append(palette);
		this.#settingCanvas();
	}

	static #createPaletteItems(){

		// 팔레트 상단 텍스트 영역
		let {topTextWrap, selectionRgbBg, previousRgbBg} = this.#createRgbaTopTextWrap()
		
		// 팔레트 중단 컬러 설정 집합 영역
		let colorWrap = Object.assign(document.createElement('div'),{
			className: 'color-wrap'
		})

		let colorPanel = this.#createColorPanel();
		let colorPaint = this.#createPaint();
		colorWrap.append(colorPanel, colorPaint, colorPanel.__colorPanelSelected, colorPanel.__colorPanelSelectedPointer);

		// 팔레트 색상 명도 조절 설정 캔버스 영역
		let brightnessColorWrap = this.#createBrightnessColor()

		// 팔레트 하단 텍스트 영역
		let {bottomTextWrap, selectionRgbText, previousRgbText} = this.#createRgbaBottomTextWrap();
		
		let {applyWrap, cancelButton, applyButton} = this.#createApplyButtonWrap();

		return {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			brightnessColorWrap, 
			bottomTextWrap, selectionRgbText, previousRgbText,
			applyWrap, cancelButton, applyButton
		};
	}

	static #createColorPanel(){
		let colorPanel = Object.assign(document.createElement('canvas'),{
			className: 'palette-panel'
		})
		let colorPanelSelected = Object.assign(document.createElement('canvas'),{
			className: 'panel_selected'
		})
		let colorPanelSelectedPointer = Object.assign(document.createElement('div'),{
			className: 'panel_selected_pointer'
		});
		colorPanelSelected.onmousedown = () => {
			colorPanel.setAttribute('data-is_mouse_down', '');
			let colorPanelRect = colorPanel.getBoundingClientRect();
			let colorPanelSelected = colorPanel.__colorPanelSelected;
			colorPanelSelected.style.top = colorPanelRect.y + 'px';
			colorPanelSelected.style.left = colorPanelRect.x + 'px';
			colorPanelSelected.style.width = colorPanelRect.width + 'px';
			colorPanelSelected.style.height = colorPanelRect.height + 'px';
			colorPanelSelected.width = colorPanelRect.width;
			colorPanelSelected.height = colorPanelRect.height;
		}
		colorPanelSelected.onmouseout = (event) => {
			colorPanel.setAttribute('data-is_mouse_out', '');
		}
		colorPanelSelected.onmouseover = (event) => {
			colorPanel.removeAttribute('data-is_mouse_out');
		}
		colorPanelSelectedPointer.onmouseout = (event) => {
			colorPanel.setAttribute('data-is_mouse_out', '');
		}
		colorPanelSelectedPointer.onmouseover = (event) => {
			colorPanel.removeAttribute('data-is_mouse_out');
		}
		colorPanel.__colorPanelSelected = colorPanelSelected;
		colorPanel.__colorPanelSelectedPointer = colorPanelSelectedPointer;

		return colorPanel;
	}

	static #createPaint(){
		let paint = Object.assign(document.createElement('canvas'),{
			className: 'palette-paint'
		});
		let context = paint.getContext('2d', { willReadFrequently: true } );
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
		let brightnessColorWrap = Object.assign(document.createElement('canvas'), {
			className: 'brightness-color'
		})
		brightnessWrap.append(brightnessColorWrap)
		let context = brightnessColorWrap.getContext('2d', { willReadFrequently: true });
		let gradient = context.createLinearGradient(0, 0, context.canvas.width, 0) 
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, this.#selectedColor);
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		
		return brightnessWrap;
	}

	static #createRgbaTopTextWrap(){
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

	static #createRgbaBottomTextWrap(){
		let bottomTextWrap = Object.assign(document.createElement('div'), {
			className: 'bottom-text-wrap'
		});
		let selection = window.getSelection();
		let sampleText = '';
		if(selection.rangeCount != 0 && selection.isCollapsed == false){
			//console.log(window.getSelection().getRangeAt(0))
			let range = window.getSelection().getRangeAt(0)
			let aticle = document.createElement('aticle');
			//commonAncestorContainer
			aticle.append(range.cloneContents())
			sampleText = aticle
		}
		sampleText = sampleText == '' ? '가 나다 라 A BC D' : sampleText;
		let selectionRgbText = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-text',
		});
		selectionRgbText.style.color = this.#selectedColor;
		
		let previousRgbText = Object.assign(document.createElement('div'), {
			className: 'previous-rgb-text',
		});
		previousRgbText.style.color = this.#selectedColor;
		
		if(sampleText.nodeType && sampleText.nodeType == Node.ELEMENT_NODE){
			selectionRgbText.innerHTML = sampleText.innerHTML;
			previousRgbText.innerHTML = sampleText.innerHTML;
		}else{
			selectionRgbText.textContent = sampleText;
			previousRgbText.textContent = sampleText;
		}


		bottomTextWrap.append(selectionRgbText, previousRgbText)

		return {bottomTextWrap, selectionRgbText, previousRgbText}
	}

	static #createApplyButtonWrap(){
		let applyWrap = Object.assign(document.createElement('div'),{
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
		applyWrap.append(cancelButton, applyButton);
		return {applyWrap, cancelButton, applyButton};
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

	static #settingCanvas(){
		return new Promise(resolve=> {
			this.#settingColorPanel()
			
			resolve();
		})
	}
	static #settingColorPanel(){
		let {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			brightnessColorWrap, 
			bottomTextWrap, selectionRgbText, previousRgbText
		} = this.#componentMap;
		let context = colorPanel.getContext('2d', { willReadFrequently: true });
		let colorPanelRect = colorPanel.getBoundingClientRect();
		colorPanel.width = colorPanelRect.width;
		colorPanel.height = colorPanelRect.height;

		// 가로 그라데이션
		let gradientH = context.createLinearGradient(0, 0, colorPanel.width, 0);
		gradientH.addColorStop(0, 'white');
		gradientH.addColorStop(1, this.#selectedColor);
		context.fillStyle = gradientH;
		context.fillRect(0, 0, colorPanel.width, colorPanel.height);
		// 수직 그라데이션
		let gradientV = context.createLinearGradient(0, 0, 0, colorPanel.height);
		gradientV.addColorStop(0, 'rgba(0,0,0,0)');
		gradientV.addColorStop(1, 'black');
		context.fillStyle = gradientV;
		context.fillRect(0, 0, colorPanel.width, colorPanel.height);
		
		colorPanel.__colorPanelSelected.style.top = colorPanelRect.y + 'px';
		colorPanel.__colorPanelSelected.style.left = colorPanelRect.x + 'px';
		colorPanel.__colorPanelSelected.style.width = colorPanelRect.width + 'px';
		colorPanel.__colorPanelSelected.style.height = colorPanelRect.height + 'px';
		colorPanel.__colorPanelSelected.width = colorPanelRect.width;
		colorPanel.__colorPanelSelected.height = colorPanelRect.height;
		if(this.#lastSelectPosition){
			this.#processingColorPanelSeleter(colorPanel.__colorPanelSelected, this.#lastSelectPosition.x - colorPanelRect.x, this.#lastSelectPosition.y - colorPanelRect.y);
		}else{
			this.#processingColorPanelSeleter(colorPanel.__colorPanelSelected, colorPanelRect.x - (colorPanelRect.x + colorPanelRect.width), colorPanelRect.y - (colorPanelRect.y + colorPanelRect.height));
		}

		colorPanel.onmouseout = (event) => {
			colorPanel.setAttribute('data-is_mouse_out', '');
		}
		colorPanel.onmouseover = (event) => {
			colorPanel.removeAttribute('data-is_mouse_out');
		}
		colorPanel.onmousedown = (event)=>{
			colorPanel.setAttribute('data-is_mouse_down', '');
			let colorPanelRect = colorPanel.getBoundingClientRect();
			let colorPanelSelected = colorPanel.__colorPanelSelected;
			colorPanel.__colorPanelSelectedPointer.style.top = event.y
			colorPanel.__colorPanelSelectedPointer.style.left = event.x
			colorPanelSelected.style.top = colorPanelRect.y + 'px';
			colorPanelSelected.style.left = colorPanelRect.x + 'px';
			colorPanelSelected.style.width = colorPanelRect.width + 'px';
			colorPanelSelected.style.height = colorPanelRect.height + 'px';
			colorPanelSelected.width = colorPanelRect.width;
			colorPanelSelected.height = colorPanelRect.height;
			this.#processingColorPanelSeleter(colorPanel.__colorPanelSelected, event.x - colorPanelRect.x, event.y - colorPanelRect.y);
		}
	}
	static #colorPanelEvent(event, isFirst = false){
		let {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			brightnessColorWrap, 
			bottomTextWrap, selectionRgbText, previousRgbText
		} = this.#componentMap;
		let rect = colorPanel.getBoundingClientRect();
		let pointerRect = colorPanel.__colorPanelSelectedPointer.getBoundingClientRect();

		let selectedPointerX = event.pageX;
		let selectedPointerY = event.pageY;

		if( pointerRect.x < rect.x ){
			selectedPointerX = rect.x;
			colorPanel.__colorPanelSelectedPointer.style.left = selectedPointerX + 'px';
		}else if( pointerRect.x > (rect.x + rect.width) ){
			selectedPointerX = rect.x + rect.width 
			colorPanel.__colorPanelSelectedPointer.style.left = selectedPointerX + 'px';
		}else {
			colorPanel.__colorPanelSelectedPointer.style.left = selectedPointerX + 'px';
		}

		if( pointerRect.y < rect.y ){
			selectedPointerY = rect.y;
			colorPanel.__colorPanelSelectedPointer.style.top = selectedPointerY + 'px'
		}else if( pointerRect.y > (rect.y + rect.height)){
			selectedPointerY = rect.y + rect.height 
			colorPanel.__colorPanelSelectedPointer.style.top = selectedPointerY + 'px'
		}else {
			colorPanel.__colorPanelSelectedPointer.style.top = selectedPointerY + 'px'
		}

		let reProcessingRect = colorPanel.__colorPanelSelectedPointer.getBoundingClientRect();
		
		let x = reProcessingRect.x - rect.x
		let y = reProcessingRect.y - rect.y
		this.#processingColorPanelSeleter(colorPanel.__colorPanelSelected, x, y);
		this.#lastSelectPosition = {x:reProcessingRect.x,y:reProcessingRect.y};

		let context = colorPanel.getContext('2d', { willReadFrequently: true });
		let [r,g,b] = context.getImageData(x, y, 1, 1).data;
		let selectedColor = `rgba(${r}, ${g}, ${b}, ${this.#a})`;
		let blackOrWhite = this.#blackOrWhite(r,g,b);
		selectionRgbBg.textContent = selectedColor;
		selectionRgbBg.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
		selectionRgbBg.style.background = selectedColor;
		
		selectionRgbText.style.color = selectedColor;
		selectionRgbText.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
	}

	static #processingColorPanelSeleter(selected, x, y){
		new Promise(resolve=>{
			let colorPanelSelectedContext = selected.getContext('2d', { willReadFrequently: true });
			
			colorPanelSelectedContext.reset();
			colorPanelSelectedContext.lineWidth = 5;
			colorPanelSelectedContext.beginPath();
			colorPanelSelectedContext.arc(x, y, 20, 0, 2 * Math.PI);
			colorPanelSelectedContext.stroke();
			resolve();
		});
	}

	//텍스트 샘플의 투명도는 0.83
	/**
	 * 
	 * @param  {...Number} rgb 
	 * @see https://stackoverflow.com/a/3943023/112731
	 * @returns 
	 */
	static #blackOrWhite(...rgb){
		let [r,g,b] = rgb;
		return (r * 0.299 + g * 0.587 + b * 0.114) > 150
            ? [0, 0, 0]
            : [255, 255, 255];
	}
	/*
	static #findPos(element){
		let curleft = 0, curtop = 0;
		if (element.offsetParent) {
			do {
				curleft += element.offsetLeft;
				curtop += element.offsetTop;
			} while (element = element.offsetParent);
			return { x: curleft, y: curtop };
		}
		return undefined;
	}
	*/
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
			.palette-wrap .palette-panel{
				width: 90%;
				position: relative;
			}
			.palette-wrap .panel_selected{
				position: fixed;
				z-index: 9999;
			}
			.palette-wrap .panel_selected_pointer{
				position: fixed;
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
			.color-wrap .panel_selected_pointer{
				width: 1px;
				height: 1px;
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
				background: #ffffffd4;
			}
			.bottom-text-wrap .previous-rgb-text{
				background: #ffffffd4;
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