import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import HyperlinkBox from "../component/HyperlinkBox";

export default class Hyperlink extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-link-style'
	});

    static hyperlinkBox;

	static{

		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-link';
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            className: `${this.#defaultStyle.id}-button`,
			innerHTML: `
				<i class="${this.#defaultStyle.id} css-gg-link-icon"></i>
			`,
			title: 'Hyperlink'
        });
		
		this.hyperlinkBox = new HyperlinkBox();
		
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.hyperlinkBox.hyperlinkBox.isConnected){
				this.hyperlinkBox.close();
			}else{
				this.hyperlinkBox.open().then(()=>{
					this.toolHandler.processingElementPosition(this.hyperlinkBox.hyperlinkBox);
				});
			}
		}

		document.addEventListener("scroll", () => {
			if(this.hyperlinkBox.hyperlinkBox.isConnected){
				this.toolHandler.processingElementPosition(this.hyperlinkBox.hyperlinkBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.hyperlinkBox.hyperlinkBox.isConnected){
                this.hyperlinkBox.open().then(()=>{
				    this.toolHandler.processingElementPosition(this.hyperlinkBox.hyperlinkBox);
                });
            }
		})

		this.hyperlinkBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.hyperlinkBox.close();
		}

		super.outClickElementListener(this.hyperlinkBox.hyperlinkBox, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.hyperlinkBox.hyperlinkBox.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
				this.hyperlinkBox.close();
			}
		});
		

	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				padding-left: 8px;
				padding-right: 8px;
			}
			.${this.#defaultStyle.id}.css-gg-link-icon{
				box-sizing: border-box;
				position: relative;
				display: block;
				transform: rotate(-45deg) scale(var(--ggs,1));
				width: 8px;
				height: 2px;
				background: currentColor;
				border-radius: 4px
			}
			.${this.#defaultStyle.id}.css-gg-link-icon::after,
			.${this.#defaultStyle.id}.css-gg-link-icon::before {
				content: "";
				display: block;
				box-sizing: border-box;
				position: absolute;
				border-radius: 3px;
				width: 8px;
				height: 10px;
				border: 2px solid;
				top: -4px
			}
			.${this.#defaultStyle.id}.css-gg-link-icon::before {
				border-right: 0;
				border-top-left-radius: 40px;
				border-bottom-left-radius: 40px;
				left: -6px
			}
			.${this.#defaultStyle.id}.css-gg-link-icon::after {
				border-left: 0;
				border-top-right-radius: 40px;
				border-bottom-right-radius: 40px;
				right: -6px
			}
			.${this.toolHandler.defaultClass} {
				color: -webkit-link;
				cursor: pointer;
				text-decoration: underline;
			}
			.${this.toolHandler.defaultClass} > [data-hyperlink_child="${Hyperlink.toolHandler.defaultClass}-child"]{
				all: initial;
				display: inline-block;
				margin-left: 1em;
				padding-left: 1em;
				border-left: 5px solid #d7d7db;
				width: inherit;
			}
			.${this.toolHandler.defaultClass} > [data-hyperlink_child="${Hyperlink.toolHandler.defaultClass}-child"] > *{
				font-size: 14px;
			}
			.${this.toolHandler.defaultClass} > [data-hyperlink_child="${Hyperlink.toolHandler.defaultClass}-child"] img{
				max-width: 100%;
                height: auto;
                aspect-ratio: attr(width) / attr(height);
			}
			.${this.toolHandler.defaultClass}-preview-url{
				position: fixed;
				z-index: 999999;
				width: 50vw;
				height: 50vh;
			}
		`
		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle?.remove();
            this.#defaultStyle = defaultStyle;
            document.head.append(this.#defaultStyle);
        }
		return this.#defaultStyle;
	}

	static get defaultStyle(){
        return this.#defaultStyle;
    }

    static set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	static set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}

	#aTag = Object.assign(document.createElement('a'), {
		target: '_blank'
	});

	/*
	#previewUrl = Object.assign(document.createElement('iframe'), {
		className: `${Hyperlink.toolHandler.defaultClass}-preview-url`,
		//referrerpolicy: 'origin',
		//allow: 'Permissions-Policy',
		//width: 100,
		//height: 100,
	});
	*/
	/*HyperlinkChild = class HyperlinkChild extends HTMLElement{
		constructor(){
			super();
			this.className = `${Hyperlink.toolHandler.defaultClass}-child`;
			this.attachShadow({ mode : 'open' });
			this.shadowRoot.append(Hyperlink.defaultStyle.cloneNode(true));
		}
	};*/

	//#hyperlinkChild;
	constructor(dataset){
		super(Hyperlink, dataset);
		/*
		if( ! window.customElements.get(`${Hyperlink.toolHandler.defaultClass}-child`)){
			window.customElements.define(`${Hyperlink.toolHandler.defaultClass}-child`, this.HyperlinkChild);
		}
		
		this.#hyperlinkChild = new this.HyperlinkChild();
		
		*/
		let getUrlMetadataPromise;

		if( ! dataset && Object.keys(this.dataset).length == 0){
			this.dataset.href = Hyperlink.hyperlinkBox.lastUrl;
			getUrlMetadataPromise = fetch(this.dataset.href, {
				mode: 'no-cors',
			}).then(response => {
				return response.text();
			}).then(htmlText => {
				let dom = new DOMParser().parseFromString(htmlText, 'text/html');
				this.dataset.title = dom.querySelector('meta[name="og:title"]')?.getAttribute('content') 
					|| dom.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
					|| dom.querySelector('title')?.textContent
					|| '';

				this.dataset.description = dom.querySelector('meta[name="description"]')?.getAttribute('content') 
					|| dom.querySelector('meta[name="og:description"]')?.getAttribute('content') 
					|| dom.querySelector('meta[name="twitter:description"]')?.getAttribute('content')
					|| ''
	
				this.dataset.image = dom.querySelector('meta[name="og:image"]')?.getAttribute('content')
					|| dom.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
					|| ''

	
				this.dataset.favicon = dom.querySelector('link[rel="icon"]')?.getAttribute('href') || '';

				this.dataset.siteName = new URL(this.dataset.href).hostname;
	
				let p = document.createElement('p')
				//this.parentEditor.createLine();
				//this.#hyperlinkChild.shadowRoot.append(line);
				//this.append(line);
				return p;
			}).catch(error=>{
				console.error(error);
				return undefined
			});
        }else{
			getUrlMetadataPromise = Promise.resolve().then(()=>{
				//let line = this.parentEditor.createLine();
				//line.contenteditable = false;
				//this.#hyperlinkChild.shadowRoot.append(line);
				//this.append(line);
				//let p = document.createElement('p')
				//return p
			});
		}
		this.#aTag.href = this.dataset.href
		super.connectedAfterOnlyOneCallback = () => {
			getUrlMetadataPromise.then(p => {
				if(! p){
					p = this.querySelector(`[data-hyperlink_child="${Hyperlink.toolHandler.defaultClass}-child"]`);
					//return;
				}
				let title;
				if(this.dataset.title != ''){
					title = Object.assign(document.createElement('p'), {
						textContent: this.dataset.title
					})
					title.style.fontWeight = 'bold';
				}
				let description;
				if(this.dataset.description != ''){
					description = Object.assign(document.createElement('p'),{
						textContent: this.dataset.description
					})
				}
				let image;
				if(this.dataset.image != ''){
					image = Object.assign(document.createElement('p'),{
						innerHTML: `
							<img data-image src="${this.dataset.image}"/>
						`
					});
				}
				let favicon;
				if(this.dataset.favicon != ''){
					favicon = Object.assign(document.createElement('span'), {
						innerHTML: `
							<img data-favicon src="${this.dataset.favicon}" style="width: 1.1em; vertical-align: text-bottom;"/>
						`
					})
				}
				let siteName = Object.assign(document.createElement('span'), {
					textContent: this.dataset.siteName
				});
				siteName.style.fontSize = '12px';
				siteName.style.fontWeight = 'bold';
				//this.#hyperlinkChild.shadowRoot.append(line);
				this.append(p);
				p.dataset.hyperlink_child = `${Hyperlink.toolHandler.defaultClass}-child`;
				p.contenteditable = false;
				p.replaceChildren(...[
					favicon, siteName,
					title,
					description,
					image
				].filter(e=>e!=undefined))
			}) 
		}
		this.onclick = (event) => {
			console.log(event);
			console.log(event.target == this);
			console.log(this.#aTag);
			if(event.target == this){
				this.#aTag.click();
			}
		}

		/*
		this.onmouseenter = () => {
			if(this.#previewUrl.src != this.dataset.href){
				this.#previewUrl.src = this.dataset.href;
			}
			if( ! this.#previewUrl.isConnected){
				document.body.append(this.#previewUrl);
				//this.append(this.#previewUrl);
			}
			Hyperlink.toolHandler.processingElementPosition(this.#previewUrl, this);
		}		

		FreedomInterface.outClickElementListener(this.#previewUrl, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.#previewUrl.isConnected && ! FreedomInterface.isMouseInnerElement(this)){
				this.#previewUrl.remove();
			}
		})
		document.addEventListener("scroll", () => {
			if(this.#previewUrl.isConnected){
				Hyperlink.toolHandler.processingElementPosition(this.#previewUrl, this);
			}
		});
		window.addEventListener('resize', (event) => {
			if(this.#previewUrl.isConnected){
				Hyperlink.toolHandler.processingElementPosition(this.#previewUrl, this);
			}
		})
		*/
	}

}