import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import HyperlinkBox from "../component/HyperlinkBox";

export default class Hyperlink extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-link-style'
	});

    static hyperlinkBox;
	static isDefaultStyle = true;
	static{

		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-link';
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            className: `${this.#defaultStyle.id}-button`,
			innerHTML: `
				<svg class="${this.#defaultStyle.id} css-gg-link-icon"
				width="0.9rem"
				height="0.9rem"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M14.8284 12L16.2426 13.4142L19.071 10.5858C20.6331 9.02365 20.6331 6.49099 19.071 4.9289C17.509 3.3668 14.9763 3.3668 13.4142 4.9289L10.5858 7.75732L12 9.17154L14.8284 6.34311C15.6095 5.56206 16.8758 5.56206 17.6568 6.34311C18.4379 7.12416 18.4379 8.39049 17.6568 9.17154L14.8284 12Z"
						fill="currentColor"
					/>
					<path
						d="M12 14.8285L13.4142 16.2427L10.5858 19.0711C9.02372 20.6332 6.49106 20.6332 4.92896 19.0711C3.36686 17.509 3.36686 14.9764 4.92896 13.4143L7.75739 10.5858L9.1716 12L6.34317 14.8285C5.56212 15.6095 5.56212 16.8758 6.34317 17.6569C7.12422 18.4379 8.39055 18.4379 9.1716 17.6569L12 14.8285Z"
						fill="currentColor"
					/>
					<path
						d="M14.8285 10.5857C15.219 10.1952 15.219 9.56199 14.8285 9.17147C14.4379 8.78094 13.8048 8.78094 13.4142 9.17147L9.1716 13.4141C8.78107 13.8046 8.78107 14.4378 9.1716 14.8283C9.56212 15.2188 10.1953 15.2188 10.5858 14.8283L14.8285 10.5857Z"
						fill="currentColor"
					/>
				</svg>
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
					super.processingElementPosition(this.hyperlinkBox.hyperlinkBox, this.toolHandler.toolButton);
				});
			}
		}

		document.addEventListener("scroll", () => {
			if(this.hyperlinkBox.hyperlinkBox.isConnected){
				super.processingElementPosition(this.hyperlinkBox.hyperlinkBox, this.toolHandler.toolButton);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.hyperlinkBox.hyperlinkBox.isConnected){
				super.processingElementPosition(this.hyperlinkBox.hyperlinkBox, this.toolHandler.toolButton);
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
			}
			.${this.#defaultStyle.id}.css-gg-link-icon{
				zoom:120%;
			}
			.${this.toolHandler.defaultClass} {
				color: -webkit-link;
				cursor: pointer;
				text-decoration: underline;
				display: grid;
			}
			.${this.toolHandler.defaultClass} > [data-hyperlink_child="${Hyperlink.toolHandler.defaultClass}-child"]{
				all: initial;
				display: inline-block;
				margin-left: 1em;
				padding-left: 1em;
				border-left: 5px solid #d7d7db;
				width: 95%;
				float: left;
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
				z-index: 9999;
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
				//this.style.color = 'red';
				//this.title = 'unknown site';
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
					if( ! p){
						return;
					}
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

				this.onclick = (event) => {
					if( ! event.composedPath().some(e=>e==p)){
						this.#aTag.click();
					}
				}
			}) 
		}

	}

}