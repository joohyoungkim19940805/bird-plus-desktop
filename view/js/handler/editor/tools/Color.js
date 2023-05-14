import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
export default class Color extends FreedomInterface {
	static options = new Options(this);
	static #style = document.createElement('style');
	//static #paletteVh = 35;
	static #paletteVw = 20; 
	static #componentMap = undefined;
	static #isPaletteActive = false;
	
	static #lastPanelPosition = undefined;
	
	static #lastPaintPosition = undefined;
	static #lastPaintRgb = [255, 0, 0];

	static #lastBrightnessPosition = undefined;

	static #r = 255;
	static #g = 0;
	static #b = 0;
	static #a = 1;

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

		this.options.showTools = button;
		this.options.showTools.onclick = ()=>{
			if(this.options.showTools.dataset.tool_status == 'active' || this.options.showTools.dataset.tool_status == 'connected'){
				this.options.showTools.dataset.tool_status = 'cancel';
			}else{
				this.#isPaletteActive = ! this.#isPaletteActive;
				if(this.#isPaletteActive == false){
					palette.remove()
				}else{
					document.head.append(this.style)
					this.#componentMap = this.#createPaletteItems();
					document.body.append(palette);
					this.#createPalette(palette, this.#componentMap);
					this.#processingPalettePosition(palette);
				}
				//this.options.showTools.dataset.tool_status = 'active'
			}
		}
		window.addEventListener('resize', (event) => {
			this.#componentMap = this.#createPaletteItems();
			this.#createPalette(palette, this.#componentMap);
			let done = setTimeout(()=>{
				this.#processingPalettePosition(palette);
				clearTimeout(done);
				done = undefined
			},500)
		})
		
		new Array('mouseup', 'touchend').forEach(eventName => {
			window.addEventListener('mouseup', () => {
				if( ! this.#componentMap){
					return;
				}
				this.#componentMap.colorPanel?.removeAttribute('data-is_mouse_down');
				this.#componentMap.colorPaint?.removeAttribute('data-is_mouse_down');
				this.#componentMap.colorBrightness?.removeAttribute('data-is_mouse_down');
			})
		})
		
		new Array('mousemove', 'touchmove').forEach(eventName=>{
			window.addEventListener(eventName, (event) => {
				if( ! this.#componentMap){
					return;
				}
				
				if(this.#componentMap.colorPanel && this.#componentMap.colorPanel.hasAttribute('data-is_mouse_down')){
					this.#colorPanelMoveEvent(event)
				}
				if(this.#componentMap.colorPaint && this.#componentMap.colorPaint.hasAttribute('data-is_mouse_down')){
					this.#colorPaintMoveEvent(event);
				}
				if(this.#componentMap.colorBrightness && this.#componentMap.colorBrightness.hasAttribute('data-is_mouse_down')){
					this.#colorBrightnessMoveEvent(event);
				}
			})
		})
	}

	static #createPalette(palette, itemMap){
		let {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			colorBrightnessWrap, colorBrightness,
			bottomTextWrap, selectionRgbText, previousRgbText,
			applyWrap, cancelButton, applyButton
		} = itemMap
		palette.replaceChildren(topTextWrap, colorWrap, colorBrightnessWrap, bottomTextWrap, applyWrap);
		this.#settingCanvas();
		this.#settingApplyEvent(palette, cancelButton, applyButton, selectionRgbText);
	}

	static #createPaletteItems(){

		// 팔레트 상단 텍스트 영역
		let {topTextWrap, selectionRgbBg, previousRgbBg} = this.#createRgbaTopTextWrap()
		
		// 팔레트 중단 컬러 설정 집합 영역
		let colorWrap = Object.assign(document.createElement('div'),{
			className: 'color-wrap'
		})

		let colorPanel = this.#createColorPanel();
		let colorPaint = this.#createColorPaint();
		colorWrap.append(colorPanel, colorPanel.__colorPanelSelected, colorPanel.__colorPanelSelectedPointer,
			colorPaint, colorPaint.__colorPaintSelectedPointer);

		// 팔레트 색상 명도 조절 설정 캔버스 영역
		let {colorBrightnessWrap, colorBrightness} = this.#createColorBrightness()

		// 팔레트 하단 텍스트 영역
		let {bottomTextWrap, selectionRgbText, previousRgbText} = this.#createRgbaBottomTextWrap();
		
		let {applyWrap, cancelButton, applyButton} = this.#createApplyButtonWrap();

		return {
			topTextWrap, selectionRgbBg, previousRgbBg, 
			colorWrap, colorPanel, colorPaint, 
			colorBrightnessWrap, colorBrightness,
			bottomTextWrap, selectionRgbText, previousRgbText,
			applyWrap, cancelButton, applyButton
		};
	}

	static #createColorPanel(){
		let colorPanel = Object.assign(document.createElement('canvas'),{
			className: 'palette-panel'
		})
		let colorPanelSelected = Object.assign(document.createElement('canvas'),{
			className: 'panel-selected'
		})
		let colorPanelSelectedPointer = Object.assign(document.createElement('div'),{
			className: 'panel-selected-pointer'
		});

		colorPanel.__colorPanelSelected = colorPanelSelected;
		colorPanel.__colorPanelSelectedPointer = colorPanelSelectedPointer;

		return colorPanel;
	}

	static #createColorPaint(){
		let colorPaint = Object.assign(document.createElement('canvas'),{
			className: 'palette-paint'
		});

		let colorPaintSelectedPointer = Object.assign(document.createElement('div'), {
			className: 'paint-selected-pointer'
		})

		colorPaint.__colorPaintSelectedPointer = colorPaintSelectedPointer


		return colorPaint;
	}

	static #createColorBrightness(){
		let colorBrightnessWrap = Object.assign(document.createElement('div'), {
			className: 'brightness-wrap'
		});
		let colorBrightness = Object.assign(document.createElement('canvas'), {
			className: 'brightness-color'
		})
		let colorBrightnessSelectedPointer = Object.assign(document.createElement('div'), {
			className: 'brightness-selected-pointer'
		});
		colorBrightness.__colorBrightnessSelectedPointer = colorBrightnessSelectedPointer;
		colorBrightnessWrap.append(colorBrightness, colorBrightness.__colorBrightnessSelectedPointer)

		return {colorBrightnessWrap, colorBrightness};
	}

	static #createRgbaTopTextWrap(){
		let topTextWrap = Object.assign(document.createElement('div'), {
			className: 'top-text-wrap'
		});
		
		let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);

		let selectionRgbBg = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-bg',
			textContent: this.#selectedColor
		});
		selectionRgbBg.style.background = this.#selectedColor;
		selectionRgbBg.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`


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
			let range = window.getSelection().getRangeAt(0)
			let aticle = document.createElement('aticle');
			//commonAncestorContainer
			aticle.append(range.cloneContents())
			sampleText = aticle
		}
		sampleText = sampleText == '' ? '가 나다 라 A BC D' : sampleText;
		let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
		
		let selectionRgbText = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-text',
		});
		selectionRgbText.style.color = this.#selectedColor;
		selectionRgbText.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`

		let previousRgbText = Object.assign(document.createElement('div'), {
			className: 'previous-rgb-text',
		});
		previousRgbText.style.color = this.#selectedColor;
		previousRgbText.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`


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
			textContent: 'apply'
		})
		applyWrap.append(cancelButton, applyButton);
		return {applyWrap, cancelButton, applyButton};
	}

	static #settingCanvas(){
		return new Promise(resolve=> {
			this.#settingColorPanel()
			this.#settingColorPaint()
			this.#settingColorBrightness();
			resolve();
		})
	}
	static #settingColorPanel(){
		return new Promise(resolve=>{
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let context = colorPanel.getContext('2d', { willReadFrequently: true });
			let colorPanelRect = colorPanel.getBoundingClientRect();
			colorPanel.width = colorPanelRect.width;
			colorPanel.height = colorPanelRect.height;

			this.#changeColorPanel(context)

			const setPanelSelectePosition = () => {
				let colorPanelRect = colorPanel.getBoundingClientRect();
				let colorPanelSelected = colorPanel.__colorPanelSelected;
				colorPanelSelected.style.top = colorPanelRect.y + 'px';
				colorPanelSelected.style.left = colorPanelRect.x + 'px';
				colorPanelSelected.style.width = colorPanelRect.width + 'px';
				colorPanelSelected.style.height = colorPanelRect.height + 'px';
				colorPanelSelected.width = colorPanelRect.width;
				colorPanelSelected.height = colorPanelRect.height;
			}

			colorPanel.onmousedown = (event)=>{
				colorPanel.setAttribute('data-is_mouse_down', '');
				let {x, y} = this.#getEventXY(event);
				colorPanel.__colorPanelSelectedPointer.style.top = y
				colorPanel.__colorPanelSelectedPointer.style.left = x
				setPanelSelectePosition()
				this.#colorPanelMoveEvent(event);
			}
			colorPanel.ontouchstart = colorPanel.onmousedown;

			colorPanel.__colorPanelSelected.onmousedown = colorPanel.onmousedown;
			colorPanel.__colorPanelSelected.ontouchstart = colorPanel.onmousedown;
			
			colorPanel.__colorPanelSelectedPointer.onmousedown = colorPanel.onmousedown;
			colorPanel.__colorPanelSelectedPointer.ontouchstart = colorPanel.onmousedown;

			resolve(setTimeout(()=>{
				setPanelSelectePosition();
				let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
				let context = colorPanel.__colorPanelSelected.getContext('2d', { willReadFrequently: true })
				let colorPanelRect = colorPanel.getBoundingClientRect();
				if(this.#lastPanelPosition){
					this.#processingColorPanelSeleter(context, this.#lastPanelPosition.x - colorPanelRect.x, this.#lastPanelPosition.y - colorPanelRect.y, blackOrWhite, true);
				}else{
					this.#processingColorPanelSeleter(context, colorPanelRect.width - 0.1, 0.1, blackOrWhite, true);
					this.#lastPanelPosition = {x:colorPanelRect.right - 0.6, y:colorPanelRect.top + 0.6}
				}
			},200))
		});
	}

	static #changeColorPanel(context){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		let [r,g,b] = this.#lastPaintRgb
		// 가로 그라데이션
		let gradientH = context.createLinearGradient(0, 0, context.canvas.width, 0);
		gradientH.addColorStop(0, 'white');
		gradientH.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.#a})`);
		context.fillStyle = gradientH;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		// 수직 그라데이션
		let gradientV = context.createLinearGradient(0, 0, 0, context.canvas.height);
		gradientV.addColorStop(0, 'rgba(0,0,0,0)');
		gradientV.addColorStop(1, 'black');
		context.fillStyle = gradientV;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}

	static #colorPanelMoveEvent(event){
		new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let rect = colorPanel.getBoundingClientRect();
			let {x:pageX, y:pageY} = this.#getEventXY(event);

			let isLeftOver = pageX < rect.left;
			let isRightOver = pageX > rect.right;
			let isTopOver = pageY < rect.top;
			let isBottomOver = pageY > rect.bottom;

			colorPanel.__colorPanelSelectedPointer.style.left = pageX + 'px';
			colorPanel.__colorPanelSelectedPointer.style.top = pageY + 'px';

			let {x : reProcessingRectX, y : reProcessingRectY} = colorPanel.__colorPanelSelectedPointer.getBoundingClientRect();
			
			let x = reProcessingRectX - rect.x
			let y = reProcessingRectY - rect.y


			if(isLeftOver){
				x = 0.6
				reProcessingRectX = rect.left + 0.6
			}
			if(isRightOver){
				x = rect.width - 0.6
				reProcessingRectX = rect.right - 0.6
			}
			if(isTopOver){
				y = 0.6
				reProcessingRectY = rect.top + 0.6
			}
			if(isBottomOver){
				y = rect.height - 0.6
				reProcessingRectY = rect.bottom - 0.6
			}

			this.#lastPanelPosition = {x : reProcessingRectX, y : reProcessingRectY};
			let context = colorPanel.getContext('2d', { willReadFrequently: true });
			
			if(isLeftOver && isTopOver){
				[this.#r, this.#g, this.#b] = [255,255,255];
			//}else if(isRightOver && isTopOver){
			//	[this.#r, this.#g, this.#b] = this.#lastPaintRgb
			}else if((isRightOver && isBottomOver) || (isLeftOver && isBottomOver) || isBottomOver){
				[this.#r, this.#g, this.#b] = [0,0,0];
			}else{
				[this.#r, this.#g, this.#b] = context.getImageData(x, y, 1, 1).data;
			}

			let selectedColor = `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
			let blackOrWhite = this.#blackOrWhite(this.#r,this.#g,this.#b);

			this.#processingColorPanelSeleter(
				colorPanel.__colorPanelSelected.getContext('2d', { willReadFrequently: true })
				, x, y, blackOrWhite);

			selectionRgbBg.textContent = selectedColor;
			selectionRgbBg.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
			selectionRgbBg.style.background = selectedColor;
			
			selectionRgbText.style.color = selectedColor;
			selectionRgbText.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			
			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.style.background = 'white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			}

			this.#changeColorBrightness(colorBrightness.getContext('2d', { willReadFrequently: true }), [this.#r, this.#g, this.#b]);

			resolve();
		})
	}

	static #processingColorPanelSeleter(colorPanelSelectedContext, x, y, [r = 0, g = 0, b = 0] = []){
		new Promise(resolve=>{
			colorPanelSelectedContext.clearRect(0, 0, colorPanelSelectedContext.canvas.width, colorPanelSelectedContext.canvas.height);
			colorPanelSelectedContext.lineWidth = 1;
			colorPanelSelectedContext.beginPath();
			colorPanelSelectedContext.arc(x, y, 10, 0, 2 * Math.PI);
			colorPanelSelectedContext.strokeStyle = `rgb(${r}, ${g}, ${b})`
			colorPanelSelectedContext.stroke();
			resolve();
		});
	}

	static #settingColorPaint(){
		return new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let colorPaintRect = colorPaint.getBoundingClientRect();
			colorPaint.width = colorPaintRect.width;
			colorPaint.height = colorPaintRect.height;

			let context = colorPaint.getContext('2d', { willReadFrequently: true } );
			let gradient = context.createLinearGradient(0, 0, 0, colorPaint.height); 

			gradient.addColorStop(0, 'rgb(255, 0, 0)') // red
			gradient.addColorStop(0.15, 'rgb(255, 0, 255)') // violet
			gradient.addColorStop(0.35, 'rgb(0, 0, 255)') // blue
			gradient.addColorStop(0.45, 'rgb(0, 255, 255)') // Sky blue
			gradient.addColorStop(0.65, 'rgb(0, 255, 0)') // green
			gradient.addColorStop(0.85, 'rgb(255, 255, 0)') // yellow
			gradient.addColorStop(0.9, 'orange')
			gradient.addColorStop(1, 'rgb(255, 0, 0)') // red
			context.fillStyle = gradient;
			context.fillRect(0, 0, colorPaint.width, colorPaint.height);

			colorPaint.onmousedown = (event) => {
				colorPaint.setAttribute('data-is_mouse_down', '');
				let {x, y} = this.#getEventXY(event);
				colorPaint.__colorPaintSelectedPointer.style.top = y + 'px';
			}
			colorPaint.ontouchstart = colorPaint.onmousedown;

			colorPaint.__colorPaintSelectedPointer.onmousedown = colorPaint.onmousedown;
			colorPaint.__colorPaintSelectedPointer.ontouchstart = colorPaint.ontouchstart;
			
			resolve(setTimeout(()=>{
				let colorPaintRect = colorPaint.getBoundingClientRect();
				if(this.#lastPaintPosition){
					colorPaint.__colorPaintSelectedPointer.style.top = this.#lastPaintPosition.y + 'px';
				}else{
					colorPaint.__colorPaintSelectedPointer.style.top = colorPaintRect.y + 'px';
					this.#lastPaintPosition = colorPaintRect.y;
				}
				colorPaint.__colorPaintSelectedPointer.style.left = colorPaintRect.x + 'px';
				colorPaint.__colorPaintSelectedPointer.style.width = colorPaintRect.width + 'px';
				let [r,g,b] = this.#blackOrWhite(...this.#lastPaintRgb);
				colorPaint.__colorPaintSelectedPointer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
			},200));
		});
	}

	static #colorPaintMoveEvent(event){
		new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let rect = colorPaint.getBoundingClientRect();
			let pageY = this.#getEventXY(event).y;

			let isTopOver = pageY < rect.top;
			let isBottomOver = pageY > rect.bottom;

			colorPaint.__colorPaintSelectedPointer.style.top = pageY + 'px';

			let {y : reProcessingRectY} = colorPaint.__colorPaintSelectedPointer.getBoundingClientRect();
			
			let y = reProcessingRectY - rect.y


			//let isOver = false;
			if(isTopOver){
				y = 0;
				reProcessingRectY = rect.top;
				//isOver = true;
			}
			if(isBottomOver){
				y = rect.height - 0.6;
				reProcessingRectY = rect.bottom - 0.6;
				//isOver = true;
			}

			this.#lastPaintPosition = {y: reProcessingRectY}
			let context = colorPaint.getContext('2d', { willReadFrequently: true });
			let [r,g,b] = context.getImageData(1, y, 1, 1).data;
			this.#lastPaintRgb = [r,g,b];
			
			colorPaint.__colorPaintSelectedPointer.style.top = reProcessingRectY + 'px';

			let blackOrWhite = this.#blackOrWhite(r,g,b);

			colorPaint.__colorPaintSelectedPointer.style.backgroundColor = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`

			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.style.background = 'white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			}

			

			this.#changeColorBrightness(colorBrightness.getContext('2d', { willReadFrequently: true }), [r,g,b]);

			this.#changeColorPanel(colorPanel.getContext('2d', { willReadFrequently: true }));
			let colorPanelRect = colorPanel.getBoundingClientRect();
			this.#processingColorPanelSeleter(
				colorPanel.__colorPanelSelected.getContext('2d', { willReadFrequently: true }),
				this.#lastPanelPosition.x - colorPanelRect.x,
				this.#lastPanelPosition.y - colorPanelRect.y,
			)
			this.#colorPanelMoveEvent({x:this.#lastPanelPosition.x, y:this.#lastPanelPosition.y})
			resolve();
		})
	}

	static #settingColorBrightness(){
		new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let colorBrightnessRect = colorBrightness.getBoundingClientRect()
			colorBrightness.width = colorBrightnessRect.width;
			colorBrightness.height = colorBrightnessRect.height;

			let context = colorBrightness.getContext('2d', { willReadFrequently: true });
			this.#changeColorBrightness(context, [this.#r, this.#g, this.#b]);

			colorBrightness.onmousedown = (event) => {
				colorBrightness.setAttribute('data-is_mouse_down', '');
				let {x, y} = this.#getEventXY(event);
				colorBrightness.__colorBrightnessSelectedPointer.style.left = x + 'px';
			}
			colorBrightness.ontouchstart = colorBrightness.onmousedown;

			colorBrightness.__colorBrightnessSelectedPointer.onmousedown = colorBrightness.onmousedown
			colorBrightness.__colorBrightnessSelectedPointer.ontouchstart = colorBrightness.onmousedown
			
			setTimeout(() => {
				let colorBrightnessRect = colorBrightness.getBoundingClientRect();
				
				if(this.#lastBrightnessPosition){
					colorBrightness.__colorBrightnessSelectedPointer.style.left = this.#lastBrightnessPosition.x + 'px';
				}else{
					colorBrightness.__colorBrightnessSelectedPointer.style.left = colorBrightnessRect.right + 'px';
				}
				
				colorBrightness.__colorBrightnessSelectedPointer.style.top = colorBrightnessRect.y + 'px';
				colorBrightness.__colorBrightnessSelectedPointer.style.height = colorBrightnessRect.height + 'px';
			}, 200)
			
			resolve();
		})
	}

	static #changeColorBrightness(context, [r = 255, g=0, b=0]){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		let gradient = context.createLinearGradient(0, 0, context.canvas.width, 0) 
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.#a})`); // 페인트 컬러로 변경 필요
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}

	static #colorBrightnessMoveEvent(event){
		new Promise(resolve=> {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;
			let rect = colorBrightness.getBoundingClientRect();

			let {x:pageX, y:pageY} = this.#getEventXY(event);

			let isLeftOver = pageX < rect.left;
			let isRightOver = pageX > rect.right;

			colorBrightness.__colorBrightnessSelectedPointer.style.left = pageX + 'px';

			let {x : reProcessingRectX} = colorBrightness.__colorBrightnessSelectedPointer.getBoundingClientRect();
			
			let x = rect.x - reProcessingRectX

			if(isLeftOver){
				x = rect.x
				reProcessingRectX = rect.x
				colorBrightness.__colorBrightnessSelectedPointer.style.left = rect.x + 'px'
				this.#a = 0
			}else if(isRightOver){
				x = rect.right
				reProcessingRectX = rect.right
				colorBrightness.__colorBrightnessSelectedPointer.style.left = rect.right + 'px';
				this.#a = 1
			}else{
				this.#a = ((rect.x - x) / rect.right).toFixed(2)
			}

			let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
			
			selectionRgbBg.textContent = this.#selectedColor;
			selectionRgbBg.style.background = this.#selectedColor;

			selectionRgbText.style.color = this.#selectedColor;

			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.style.background = 'white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.style.background = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			}

			resolve()
		});
	}

	static #settingApplyEvent(palette, cancelButton, applyButton, selectionRgbText){
		cancelButton.onclick = () => {
			this.#isPaletteActive = false;
			palette.remove();
		}
		applyButton.onclick = () => {

		}
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
	
	static #getEventXY(event){
		let x;
		let y;
		if(window.TouchEvent && event.constructor == window.TouchEvent){
			x = event.touches[0].pageX
			y = event.touches[0].pageY
			event.preventDefault();
		}else{
			x = event.x
			y = event.y
		}
		return {x,y};
	}

	static get #selectedColor(){
		return `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
	}

	static set style(style){
		this.#style.textContent = style;
	}

	static set addStyle(addStyle){
		this.#style.textContent = this.#style.textContent + addStyle;
	}
	

	static get style(){
		this.#style.textContent = `
			.palette-wrap{
				background: #000000bf;
				position: fixed;
				padding: 0.9%;
				width: ${this.#paletteVw}vw;
				height: fit-content;
				color: white;
				font-size: 13px;
				min-width: 300px;
				-webkit-user-select:none;
				-moz-user-select:none;
				-ms-user-select:none;
				user-select:none
			}
			.palette-wrap .palette-panel{
				width: 90%;
				position: relative;
			}

			/* 상단 텍스트 영역 [S] */
			.palette-wrap .top-text-wrap{
				display: flex;
				justify-content: space-between;
				margin-bottom: 2%;
				height: 8%;
			}
			.palette-wrap .top-text-wrap .selection-rgb-bg{
				width: 100%;
				text-align-last: center;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.palette-wrap .top-text-wrap .previous-rgb-bg{
				text-align-last: center;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 11.5%;
			}
			/* 상단 텍스트 영역 [E] */

			/* 컬러 영역 영역 [S] */
			.palette-wrap .color-wrap{
				display: flex;
				justify-content: space-between;
				margin-bottom: 2%;
			}

			.palette-wrap .color-wrap .panel-selected{
				position: fixed;
				z-index: 9999;
			}
			.palette-wrap .color-wrap .panel-selected-pointer{
				position: fixed;
				width: 1px;
				height: 1px;
			}

			.palette-wrap .color-wrap .palette-paint{
				width: 5%;
			}
			.palette-wrap .color-wrap .paint-selected-pointer{
				position: fixed;
				height: 1px;
			}
			/* 컬러 영역 영역 [E] */

			/* 투명도 영역 [S] */
			.palette-wrap .brightness-wrap{
				margin-bottom: 2%;
				background-image: /* tint image */ linear-gradient(to right, rgb(192 192 192 / 20%), rgb(192 192 192 / 20%)), /* checkered effect */ linear-gradient(to right, #505050 50%, #a1a1a1 50%), linear-gradient(to bottom, #505050 50%, #a1a1a1 50%);
				background-blend-mode: normal, difference, normal;
				background-size: 2em 2em;
				display: flex;
			}
			.palette-wrap .brightness-wrap .brightness-color{
				height: 2vh;
				width: 100%;
				min-height: 17px;
			}
			.palette-wrap .brightness-wrap .brightness-selected-pointer{
				position: fixed;
				width: 1px;
			}
			/* 투명도 영역 [E] */

			/* 하단 텍스트 영역 [S] */
			.palette-wrap .bottom-text-wrap{
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 2%;
			}
			.palette-wrap .bottom-text-wrap .selection-rgb-text{
				background: #ffffffd4;
			}
			.palette-wrap .bottom-text-wrap .previous-rgb-text{
				background: #ffffffd4;
			}
			/* 하단 텍스트 영역 [E] */

			/* 버튼 영역 [S] */
			.palette-wrap .button-wrap {
				display: flex;
				justify-content: space-around;
			}
			.palette-wrap .cancel-button, .palette-wrap .apply-button{
				background: none;
				border: revert;
				color: #b9b9b9;
			}
			/* 버튼 영역 [E] */
		`;
		return this.#style;
	}

	#isLoaded = false;
	constructor(){
		super(Color);
		this.style.color = 'red';
	}


}