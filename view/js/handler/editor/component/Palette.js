
export default class Palette {
	
	#style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-palette'
	});

	#palette = Object.assign(document.createElement('div'),{
		className: 'palette-wrap'
	});

	#paletteVw = 20; 
	#componentMap = undefined;
	
	#lastPanelPosition = undefined;
	
	#lastPaintPosition = undefined;
	#lastPaintRgb = [255, 0, 0];

	#lastBrightnessPosition = undefined;

	#r = 255;
	#g = 0;
	#b = 0;
	#a = 1;

    #openPositionMode;
	#openPosition;
	#exampleMode;

    #applyCallback = () => {}

	static ExampleMode = class ExampleMode{
		static #ExampleModeEnum = class ExampleModeEnum{
			value;
			constructor(value){
				this.value = value;
				Object.freeze(this);
			}
		}
		static TEXT_COLOR = new this.#ExampleModeEnum('color');
		static TEXT_BACKGROUND_COLOR = new this.#ExampleModeEnum('background-color');
		static TEXT_UNDERLINE = new this.#ExampleModeEnum('text-decoration');
		static TEXT_LINE_THROUGH = new this.#ExampleModeEnum('text-decoration');
		value;
		static{
			Object.freeze(this);
		}
		constructor(value){
			this.value = value;
			Object.freeze(this);
		}
	}

	static OpenPositionMode = class OpenPositionMode{
		static BUTTON = new OpenPositionMode('button')
		static WRAPPER = new OpenPositionMode('wrapper')
		/**
		 * @returns {String}
		 */
		value;
		static{
			Object.freeze(this);
		}
		constructor(value){
			this.value = value;
			Object.freeze(this);
		}
	}

    constructor({
		openPositionMode = Palette.OpenPositionMode.BUTTON,
		openPosition,
		exampleMode = Palette.ExampleMode.TEXT_COLOR
	}={}){
		
        this.#openPositionMode = openPositionMode;
		if( ! this.#openPositionMode ){//|| ! (this.#openPositionMode instanceof Palette.OpenPositionMode)){
			throw new Error('this is not OpenPositionMode');
		}
		this.#openPosition = openPosition;
        if( ! this.#openPosition || ! this.#openPosition.nodeType || this.#openPosition.nodeType != Node.ELEMENT_NODE){
            throw new Error('openPosition is not element');
        }
		this.#exampleMode = exampleMode;
		
		if(this.#openPositionMode == Palette.OpenPositionMode.BUTTON){
			this.#palette.style.position = "fixed";
		}

        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }

        document.addEventListener("scroll", () => {
			if(this.#palette.isConnected){
				this.#processingPalettePosition(this.#palette);
			}
		});

        window.addEventListener('resize', (event) => {
            if(this.#palette.isConnected){
                this.reset();
                this.#palette.replaceChildren();
                let done = setTimeout(()=>{
                    this.open();
                    clearTimeout(done);
                    done = undefined
                },200)
            }
		})

        new Array('mouseup', 'touchend').forEach(eventName => {
			window.addEventListener(eventName, () => {
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

    #createPalette(palette, itemMap){
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

    #createPaletteItems(){

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

    #createColorPanel(){
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

    #createColorPaint(){
		let colorPaint = Object.assign(document.createElement('canvas'),{
			className: 'palette-paint'
		});

		let colorPaintSelectedPointer = Object.assign(document.createElement('div'), {
			className: 'paint-selected-pointer'
		})
		colorPaintSelectedPointer.append(Object.assign(document.createElement('div'),{
			className: 'paint-selected-pointer-child'
		}));
		colorPaint.__colorPaintSelectedPointer = colorPaintSelectedPointer

		return colorPaint;
	}

    #createColorBrightness(){
		let colorBrightnessWrap = Object.assign(document.createElement('div'), {
			className: 'brightness-wrap'
		});
		let colorBrightness = Object.assign(document.createElement('canvas'), {
			className: 'brightness-color'
		})
		let colorBrightnessSelectedPointer = Object.assign(document.createElement('div'), {
			className: 'brightness-selected-pointer'
		});
		colorBrightnessSelectedPointer.append(Object.assign(document.createElement('div'), {
			className: 'brightness-selected-pointer-child'
		}));
		colorBrightness.__colorBrightnessSelectedPointer = colorBrightnessSelectedPointer;
		colorBrightnessWrap.append(colorBrightness, colorBrightness.__colorBrightnessSelectedPointer)

		return {colorBrightnessWrap, colorBrightness};
	}

    #createRgbaTopTextWrap(){
		let topTextWrap = Object.assign(document.createElement('div'), {
			className: 'top-text-wrap'
		});
		
		let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);

		let selectionRgbBg = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-bg',
			textContent: this.selectedColor
		});
		selectionRgbBg.style.background = this.selectedColor;
		selectionRgbBg.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`


		let previousRgbBg = Object.assign(document.createElement('div'), {
			className : 'previous-rgb-bg',
		});
		previousRgbBg.style.background = this.selectedColor;

		topTextWrap.append(selectionRgbBg, previousRgbBg)

		return {topTextWrap, selectionRgbBg, previousRgbBg}
	}

    #createRgbaBottomTextWrap(){
		let bottomTextWrap = Object.assign(document.createElement('div'), {
			className: 'bottom-text-wrap'
		});
		let selection = window.getSelection();
		let sampleText = '';
		if(selection.rangeCount != 0 && selection.isCollapsed == false){
			let range = selection.getRangeAt(0)
			let aticle = document.createElement('aticle');
			let rangeClone = range.cloneContents();
			aticle.append(rangeClone);
			sampleText = aticle
		}
		sampleText = sampleText == '' ? '가 나다 라 A BC D' : sampleText;
		let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
		
		let selectionRgbText = Object.assign(document.createElement('div'), {
			className: 'selection-rgb-text',
		});
		this.#applyExampleTextColor(selectionRgbText, this.selectedColor, blackOrWhite);

		let previousRgbText = Object.assign(document.createElement('div'), {
			className: 'previous-rgb-text',
		});
		this.#applyExampleTextColor(previousRgbText, this.selectedColor, blackOrWhite);

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

    #createApplyButtonWrap(){
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
		applyWrap.append(applyButton, cancelButton);
		return {applyWrap, applyButton, cancelButton};
	}

    #settingCanvas(){
		return new Promise(resolve=> {
			this.#settingColorPanel()
			this.#settingColorPaint()
			this.#settingColorBrightness();
			resolve();
		})
	}

    #settingColorPanel(){
		return new Promise(resolve=>{
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;

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
				let panelContext = colorPanel.getContext('2d', { willReadFrequently: true });
				let colorPanelRect = colorPanel.getBoundingClientRect();
				colorPanel.width = colorPanelRect.width;
				colorPanel.height = colorPanelRect.height;
                setPanelSelectePosition();
				this.#changeColorPanel(panelContext)

				let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
				let context = colorPanel.__colorPanelSelected.getContext('2d', { willReadFrequently: true })
				if(this.#lastPanelPosition){
					this.#processingColorPanelSeleter(context, this.#lastPanelPosition.x - colorPanelRect.x, this.#lastPanelPosition.y - colorPanelRect.y, blackOrWhite);
				}else{
					this.#processingColorPanelSeleter(context, colorPanelRect.width - 1, 0.1, blackOrWhite);
					this.#lastPanelPosition = {x:colorPanelRect.right - 1, y:colorPanelRect.top}
                    colorPanel.__colorPanelSelectedPointer.style.top = this.#lastPanelPosition.y + 'px';
                    colorPanel.__colorPanelSelectedPointer.style.left = this.#lastPanelPosition.x + 'px';
                }
			},200))
		});
	}

    #changeColorPanel(context){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		let [r,g,b] = this.#lastPaintRgb
		// 가로 그라데이션
		let gradientH = context.createLinearGradient(2, 0, context.canvas.width - 2, 0);
		gradientH.addColorStop(0, 'white');
		gradientH.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.#a})`);
		context.fillStyle = gradientH;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		// 수직 그라데이션
		let gradientV = context.createLinearGradient(0, 2, 0, context.canvas.height - 2);
		gradientV.addColorStop(0, 'rgba(0,0,0,0)');
		gradientV.addColorStop(1, 'black');
		context.fillStyle = gradientV;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}

    #processingColorPanelSeleter(colorPanelSelectedContext, x, y, [r = 0, g = 0, b = 0] = []){
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

    #colorPanelMoveEvent(event){
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
			let isRightOver = pageX > rect.right - 1;
			let isTopOver = pageY < rect.top;
			let isBottomOver = pageY > rect.bottom;

			colorPanel.__colorPanelSelectedPointer.style.left = pageX + 'px';
			colorPanel.__colorPanelSelectedPointer.style.top = pageY + 'px';

			let {x : reProcessingRectX, y : reProcessingRectY} = colorPanel.__colorPanelSelectedPointer.getBoundingClientRect();
			
			let x = reProcessingRectX - rect.x
			let y = reProcessingRectY - rect.y


			if(isLeftOver){
				x = 0
				reProcessingRectX = rect.left
			}
			if(isRightOver){
				x = rect.width - 1
				reProcessingRectX = rect.right - 1
			}
			if(isTopOver){
				y = 0
				reProcessingRectY = rect.top
			}
			if(isBottomOver){
				y = rect.height
				reProcessingRectY = rect.bottom
			}

			this.#lastPanelPosition = {x : reProcessingRectX, y : reProcessingRectY};
			let context = colorPanel.getContext('2d', { willReadFrequently: true });
			
			/*if(isLeftOver && isTopOver){
				[this.#r, this.#g, this.#b] = [255,255,255];
			//}else if(isRightOver && isTopOver){
			//	[this.#r, this.#g, this.#b] = this.#lastPaintRgb
			}else if((isRightOver && isBottomOver) || (isLeftOver && isBottomOver) || isBottomOver){
				[this.#r, this.#g, this.#b] = [0,0,0];
			}else{*/
				[this.#r, this.#g, this.#b] = context.getImageData(x, y, 1, 1).data;
			//}

			let selectedColor = `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
			let blackOrWhite = this.#blackOrWhite(this.#r,this.#g,this.#b);

			this.#processingColorPanelSeleter(
				colorPanel.__colorPanelSelected.getContext('2d', { willReadFrequently: true })
				, x, y, blackOrWhite);

			selectionRgbBg.textContent = selectedColor;
			selectionRgbBg.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
			selectionRgbBg.style.background = selectedColor;
			
			this.#applyExampleTextColor(selectionRgbText, selectedColor, blackOrWhite);

			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = 'solid 1px white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = `solid 1px rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			}

			this.#changeColorBrightness(colorBrightness.getContext('2d', { willReadFrequently: true }), [this.#r, this.#g, this.#b]);

			resolve();
		})
	}

    #settingColorPaint(){
		return new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;

			colorPaint.onmousedown = (event) => {
				colorPaint.setAttribute('data-is_mouse_down', '');
				let {x, y} = this.#getEventXY(event);
				colorPaint.__colorPaintSelectedPointer.style.top = y + 'px';
				this.#colorPaintMoveEvent(event);
			}
			colorPaint.ontouchstart = colorPaint.onmousedown;

			colorPaint.__colorPaintSelectedPointer.onmousedown = colorPaint.onmousedown;
			colorPaint.__colorPaintSelectedPointer.ontouchstart = colorPaint.ontouchstart;
			
			resolve(setTimeout(()=>{
				let colorPaintRect = colorPaint.getBoundingClientRect();
				colorPaint.width = colorPaintRect.width;
				colorPaint.height = colorPaintRect.height;
	
				let context = colorPaint.getContext('2d', { willReadFrequently: true } );
                context.clearRect(0, 0, colorPaint.width, colorPaint.height);

                let gradient = context.createLinearGradient(0, 2, 0, colorPaint.height - 2); 
	
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

				if(this.#lastPaintPosition){
					colorPaint.__colorPaintSelectedPointer.style.top = this.#lastPaintPosition.y + 'px';
				}else{
					colorPaint.__colorPaintSelectedPointer.style.top = colorPaintRect.y + 'px';
					this.#lastPaintPosition = colorPaintRect.y;
				}
				colorPaint.__colorPaintSelectedPointer.style.left = colorPaintRect.x + 'px';
				colorPaint.__colorPaintSelectedPointer.style.width = colorPaintRect.width + 'px';
				let [r,g,b] = this.#blackOrWhite(...this.#lastPaintRgb);
				colorPaint.__colorPaintSelectedPointer.children[0].style.border = `solid 1px rgb(${r}, ${g}, ${b})`
			},200));
		});
	}

    #colorPaintMoveEvent(event){
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
			let isBottomOver = pageY > rect.bottom - 1;

			colorPaint.__colorPaintSelectedPointer.style.top = pageY + 'px';

			let {y : reProcessingRectY} = colorPaint.__colorPaintSelectedPointer.getBoundingClientRect();
			
			let y = reProcessingRectY - rect.y


			let isOver = false;
			if(isTopOver){
				y = 0;
				reProcessingRectY = rect.top;
				isOver = true;
			}
			if(isBottomOver){
				y = rect.height - 1
				reProcessingRectY = rect.bottom - 1
				isOver = true;
			}

			this.#lastPaintPosition = {y: reProcessingRectY}
			let context = colorPaint.getContext('2d', { willReadFrequently: true });
			let r,g,b;
			if(isOver){
				[r,g,b] = [255, 0, 0];
			}else{
				[r,g,b] = context.getImageData(1, y, 1, 1).data;
			}
			this.#lastPaintRgb = [r,g,b]

			colorPaint.__colorPaintSelectedPointer.style.top = reProcessingRectY + 'px';

			let blackOrWhite = this.#blackOrWhite(r,g,b);

			colorPaint.__colorPaintSelectedPointer.children[0].style.border = `solid 1px rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`

			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = 'solid 1px white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = `solid 1px rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
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

    #settingColorBrightness(){
		new Promise(resolve => {
			let {
				topTextWrap, selectionRgbBg, previousRgbBg, 
				colorWrap, colorPanel, colorPaint, 
				colorBrightnessWrap, colorBrightness,
				bottomTextWrap, selectionRgbText, previousRgbText
			} = this.#componentMap;

			colorBrightness.onmousedown = (event) => {
				colorBrightness.setAttribute('data-is_mouse_down', '');
				let {x, y} = this.#getEventXY(event);
				colorBrightness.__colorBrightnessSelectedPointer.style.left = x + 'px';
				this.#colorBrightnessMoveEvent(event);
			}
			colorBrightness.ontouchstart = colorBrightness.onmousedown;

			colorBrightness.__colorBrightnessSelectedPointer.onmousedown = colorBrightness.onmousedown
			colorBrightness.__colorBrightnessSelectedPointer.ontouchstart = colorBrightness.onmousedown
			
			setTimeout(() => {
                let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
				let colorBrightnessRect = colorBrightness.getBoundingClientRect()
				colorBrightness.width = colorBrightnessRect.width;
				colorBrightness.height = colorBrightnessRect.height;
	
				let context = colorBrightness.getContext('2d', { willReadFrequently: true });
				this.#changeColorBrightness(context, [this.#r, this.#g, this.#b]);

				if(this.#lastBrightnessPosition){
					colorBrightness.__colorBrightnessSelectedPointer.style.left = this.#lastBrightnessPosition.x + 'px';
				}else{
					colorBrightness.__colorBrightnessSelectedPointer.style.left = colorBrightnessRect.right + 'px';
				}
				
				colorBrightness.__colorBrightnessSelectedPointer.style.top = colorBrightnessRect.y + 'px';
				colorBrightness.__colorBrightnessSelectedPointer.style.height = colorBrightnessRect.height + 'px';
                colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = `solid 1px rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
            }, 200)
			
			resolve();
		})
	}

    #changeColorBrightness(context, [r = 255, g=0, b=0]){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		let gradient = context.createLinearGradient(0, 0, context.canvas.width, 0) 
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.#a})`); // 페인트 컬러로 변경 필요
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}

    #colorBrightnessMoveEvent(event){
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
				this.#a = ((reProcessingRectX - rect.x) / rect.width).toFixed(2)
			}

			let blackOrWhite = this.#blackOrWhite(this.#r, this.#g, this.#b);
			
			selectionRgbBg.textContent = this.selectedColor;
			selectionRgbBg.style.background = this.selectedColor;

			selectionRgbText.style.color = this.selectedColor;
			this.#applyExampleTextColor(selectionRgbText, this.selectedColor, blackOrWhite);
			if(this.#a < 0.75){
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = 'solid 1px white';
			}else{
				colorBrightness.__colorBrightnessSelectedPointer.children[0].style.border = `solid 1px rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`;
			}

			resolve()
		});
	}

    #settingApplyEvent(palette, cancelButton, applyButton, selectionRgbText){
		cancelButton.onclick = () => {
			this.close();
			//palette.remove();
		}
		applyButton.onclick = (event) => {
            this.applyCallback(event);
		}
	}

    #processingPalettePosition(palette){
		if(this.#openPositionMode == Palette.OpenPositionMode.BUTTON){
			let {x, y, height} = this.#openPosition.getBoundingClientRect();
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
		}else if(this.#openPositionMode == Palette.OpenPositionMode.WRAPPER){
			this.#openPosition.append(palette);
		}
	}

	/**
	 * @see https://stackoverflow.com/a/3943023
	 * @param  {...any} rgb 
	 * @returns 
	 */
    #blackOrWhite(...rgb){
		let [r,g,b] = rgb;
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? [0, 0, 0]
            : [255, 255, 255];
	}

    #getEventXY(event){
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

	/**
	 * 
	 * @param {HTMLElement} text 
	 * @param {String} color 
	 * @param {Array<Number>} blackOrWhite 
	 */
	#applyExampleTextColor(text, color, blackOrWhite){
		if(this.#exampleMode == Palette.ExampleMode.TEXT_COLOR){
			text.style.color = color
			if(blackOrWhite && blackOrWhite.length != 0){
				text.style.backgroundColor = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
			}
		}else if(this.#exampleMode == Palette.ExampleMode.TEXT_BACKGROUND_COLOR){
			text.style.backgroundColor = color
			if(blackOrWhite && blackOrWhite.length != 0){
				text.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
			}
		}else if(this.#exampleMode == Palette.ExampleMode.TEXT_UNDERLINE){
			text.style.textDecoration = 'underline'
			text.style.textDecorationColor = color
			
			if(blackOrWhite && blackOrWhite.length != 0){
				text.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
				text.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
				/*if(blackOrWhite.filter(e=>e==255).length == 3){
					text.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
				}else{
					text.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
				}*/
			}
			
		}else if(this.#exampleMode == Palette.ExampleMode.TEXT_LINE_THROUGH){
			text.style.textDecoration = 'line-through'
			text.style.textDecorationColor = color;
			
			if(blackOrWhite && blackOrWhite.length != 0){
				text.style.color = `rgb(${blackOrWhite[0]}, ${blackOrWhite[1]}, ${blackOrWhite[2]})`
				text.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
			}
			
		}
	}

    get selectedColor(){
		return `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
	}

    get palette(){
        return this.#palette;
    }

    get isConnected(){
        return this.#palette.isConnected;
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

	get style(){
		return this.#style;
	}

	set style(style){
        this.#style.textContent = style;
    }

	set insertStyle(style){
		this.#style.sheet.insertRule(style);
	}

	get r(){
		return this.#r;
	}
	get g(){
		return this.#g;
	}
	get b(){
		return this.#b;
	}
	get a(){
		return this.#a;
	}

    reset(){
		this.#r = 255;
		this.#g = 0;
		this.#b = 0;
		this.#a = 1;
		this.#lastPaintRgb = [255, 0, 0];
		this.#lastPanelPosition = undefined;
		this.#lastPaintPosition = undefined;
		this.#lastBrightnessPosition = undefined;
        this.#componentMap = undefined;
        
	}

    close(){
        this.#palette.remove();
    }

    open(){
        this.#componentMap = this.#createPaletteItems();
        document.body.append(this.#palette);
        this.#createPalette(this.#palette, this.#componentMap);
        this.#processingPalettePosition(this.#palette);
    }

    createStyle(){
		//position: fixed; 제거 20230517
		this.#style.textContent = `
			.palette-wrap{
				background: #343434;
				padding: 0.9%;
				width: ${this.#paletteVw}vw;
				height: fit-content;
				color: white;
				font-size: 13px;
				min-width: 300px;
				z-index: 999;
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
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #faebd700;
			}
			.palette-wrap .color-wrap .paint-selected-pointer-child{
				position: absolute;
				border: solid 1px;
				height: 2px;
				width: inherit;
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
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #faebd700;
			}
			.palette-wrap .brightness-wrap .brightness-selected-pointer-child{
				position: absolute;
				border: solid 1px;
				height: inherit;
				width: 2px;
				background: inherit;
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
				margin-right: 5%;
			}
			.palette-wrap .bottom-text-wrap .selection-rgb-text, .palette-wrap .bottom-text-wrap .previous-rgb-text{
				overflow-x: hidden;
				max-width: 40%;
				text-overflow: ellipsis;
				width: fit-content;
				background: rgba(255, 255, 255, 0.25);
				color: rgba(255, 255, 255, 0.25);
			}
			.palette-wrap .bottom-text-wrap .selection-rgb-text *, .palette-wrap .bottom-text-wrap .previous-rgb-text *{
				text-overflow: ellipsis;
				overflow-x: hidden;
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
				border-color: #464646;
			}
			/* 버튼 영역 [E] */
		`;
		return this.#style;
	}
}