export default class HyperlinkBox{
	#style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-hyperlink-box'
	});

	#hyperlinkBox = Object.assign(document.createElement('div'),{
		className: 'hyperlink-box-wrap'
	});

	#hyperlinkBoxVw = 20;

	#urlInputText = Object.assign(document.createElement('input'), {
        autocomplete: 'off',
        placeholder: 'Please enter your link ',
        type: 'url',
        name: 'hyperlink-url-input',
        className: 'hyperlink-url-input',
		required: false,
        /*
		oninput: (event) => this.#searchInputTextEvent(event),
        onkeyup: (event) => {
            if(event.key == 'Enter' && this.#searchInputText.value != ''){
                let item = this.#fontSizeBoxContainer.querySelector(`[data-size="${this.#searchInputText.value}"]`);
                this.#apply(item, event);
            }
        },
		*/
    });

	#invalidUrlMessage = Object.assign(document.createElement('span'), {

	})

	#applyCallback = () => {}
	
    #lastSelectionRange;

	#lastUrl;

	constructor(){
		let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }
		let urlInputTextWrapper = Object.assign(document.createElement('div'), {
			//id: 'url-input-text-wrapper',
			className: 'url-input-text-wrapper',
			/*onsubmit : (event) => {
				event.preventDefault();
				applyButton.click();
			}*/
		})
		urlInputTextWrapper.append(this.#urlInputText);
		this.#urlInputText.oninput = (event) => {
			if(this.#invalidUrlMessage.isConnected){
				this.#invalidUrlMessage.remove();
			}
		}
		this.#urlInputText.onkeydown = (event) => {
			if(event.key == 'Enter'){
				event.preventDefault();
				applyButton.onclick();
			}

		}

		let cancelButton = Object.assign(document.createElement('button'), {
			className: 'cancel-button',
			type: 'button',
			textContent: 'cancel'
		})
		cancelButton.onclick = () => {
			this.close();
		}
		let applyButton = Object.assign(document.createElement('button'), {
			className: 'apply-button',
			type: 'button',
			textContent: 'apply'
		})
		applyButton.onclick = (event) => {
			if( ! this.#urlInputText.checkValidity()){
				let prevValue = this.#urlInputText.value
				this.#urlInputText.value = `https://${this.#urlInputText.value}`;
				if(! this.#urlInputText.checkValidity()){
					this.#urlInputText.value = prevValue;
					return;
				}
			}
			this.lastUrl = this.#urlInputText.value;
			this.#urlInputText.value = '';
			if(this.#lastSelectionRange){
				let selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(this.#lastSelectionRange);
			}
			this.applyCallback(event);
		}
		let buttonWrapeer = Object.assign(document.createElement('div'), {
			className: 'button-wrap',
		})
		buttonWrapeer.append(cancelButton, applyButton);
		this.#hyperlinkBox.append(urlInputTextWrapper, buttonWrapeer)
	}

    async open(){
		let selection = window.getSelection();
		if(selection.rangeCount != 0 && selection.isCollapsed == false){
			let range = selection.getRangeAt(0);
			this.#lastSelectionRange = range.cloneRange();
		}
		document.body.append(this.#hyperlinkBox);
		let appendAwait = setInterval(()=>{
			if( ! this.#hyperlinkBox.isConnected){
				return;
			}
			clearInterval(appendAwait);
			this.#urlInputText.focus();
		},50)
    }

    close(){
        this.#hyperlinkBox.remove();
    }
    
	set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

	get hyperlinkBox(){
		return this.#hyperlinkBox;
	}

	createStyle(){
		this.#style.textContent = `
			.hyperlink-box-wrap{
				background: #343434;
				position: fixed;
				padding: 0.9%;
				width: ${this.#hyperlinkBoxVw}vw;
				height: auto;
				color: white;
				min-width: 100px;
				overflow-y: auto;
				-webkit-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				overflow-x: hidden;
				display: grid;
				gap: 1vh;
				align-content: center;
				justify-content: space-around;
				align-items: center;
				justify-items: center;
                z-index: 999;
			}
			.hyperlink-box-wrap .url-input-text-wrapper{
				width: inherit;
			}
			.hyperlink-box-wrap .url-input-text-wrapper .hyperlink-url-input{
				width: -webkit-fill-available;
				background-color: #ffffff00;
				color: #b9b9b9;
				border-bottom: solid 1px #4c4c4c;
				border-left: solid 1px #4c4c4c;
			}
			.hyperlink-box-wrap .button-wrap{
				display: flex;
				justify-content: space-around;
				width: inherit;
			}
			.hyperlink-box-wrap .button-wrap .apply-button,
			.hyperlink-box-wrap .button-wrap .cancel-button {
				background: none;
				border: revert;
				color: #b9b9b9;
				border-color: #464646;
			}
		`
		return this.#style;
	}
}