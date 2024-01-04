const { contextBridge, ipcRenderer } = require('electron')
const style = Object.assign(document.createElement('style'), {
	textContent : `
		h1{
			padding-left: 4%;
			padding-bottom: 1%;
			border-bottom: solid 1px #838383;
		}
		details {
			border: 1px solid #aaa;
			border-radius: 4px;
			padding: 0.5em 0.5em 0;
			width: fit-content;
		}
		summary{
			font-weight: bold;
			margin: -0.5em -0.5em 0;
			padding: 0.5em;
			flex-wrap: revert-layer;
			display: flex;
			justify-content: space-between;
			font-size: 90%;
		}
		details[open] {
			padding: 0.5em;
			width: auto;
		}
		details[open] > summary::after{
			content: ' ▼';
			display: inline-flex;
			transform: translate(3px, -1px);
			padding-right: 1vw;
		}
		details > summary::after{
			content: ' ▶';
			display: inline-flex;
			transform: translate(3px, -1px);
			padding-right: 1vw;
		}
		details > .update_history_details_list{
			font-size: 90%;
			color: #eefffd;
			display: flex;
			flex-direction: column;
			gap: 3px;
		}

		.update_history_wrapper{
			width: inherit;
			height: inherit;
			color: white;
			background: linear-gradient(to bottom, #EAEAEA -274%, #2B2B2B 96%, #7c0000ab 200%);
			display: inline-flex;
			flex-direction: column;
		}

		.update_history_wrapper .update_history_button_container{
			display: flex;
			flex-direction: row-reverse;
			padding-top: 1%;
			padding-bottom: 5%;
		}
		.update_history_button_container .update_history_button{
			color: black;
			font-size: 3vmax;
			font-weight: bold;
			font-family: revert-layer;
			border-radius: 15px;
			border: solid 3px #493d3d;
		}

		.update_history_wrapper .update_history_list{
			height: inherit;
			width: inherit;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}
		.update_history_wrapper .update_history_list:hover::-webkit-scrollbar-thumb {
			box-shadow: inset 0 0 5px #eee1e1;
		}

		.update_history_list .update_history_item{
			display: flex;
			align-items: center;
			justify-content: space-around;
			border-bottom: solid 1px #73737329;
		}

		.update_history_item .update_history_subject {
			width: 35%;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.update_history_item .update_history_author,
		.update_history_item .update_history_date{
			font-size: 80%;
			color: #bfbfbf;
		}

	`
});

const wrapper = Object.assign(document.createElement('div'), {
	className : 'update_history_wrapper',
	innerHTML:`
	<div class="update_history_wrapper">
		<h1>Latest Update History</h1>
		<div class="update_history_button_container">
			<button class="update_history_button">Start Updating.</button>
		</div>
		<ul class="update_history_list list_scroll list_scroll-y">
		</ul>
	</div>
	`
})

ipcRenderer.on('updateHistory', (event, message = []) => {
	//console.log(event, message);
	let updateHistoryContainer = wrapper.querySelector('.update_history_list');
	let liList = message.map(e=>{
		let {subject, authorName, authorDate, files} = e;
		//console.log(e);
		let li = Object.assign(document.createElement('li'), {
			className : 'update_history_item',
			innerHTML : `
				<div class="update_history_subject">${subject}</div>
				<div class="update_history_author">${authorName}</div>
				<div class="update_history_date">(${
					new Date(authorDate).toLocaleString({
						year: '2-digit', month: 'short', weekday: 'short', day: '2-digit',
						formatMatcher: 'best fit', hour: '2-digit', minute: '2-digit', second: '2-digit'
					})
				})</div>
				<details>
					<summary>Details</summary>
					<ul class="update_history_details_list">
						${
							files.map(e => `<li class="update_history_details_item">${e}</li>`).join('')
						}
					</ul>
				</details>
			`
			//test
		})
		
		console.log(li);
		return li;
	})
	
	updateHistoryContainer.prepend(...liList.reverse());
	//console.log(liList);
	/*
	new Date(Number(node.dataset.reply_mils)).toLocaleString({
		year: '2-digit', month: 'short', weekday: 'short', day: '2-digit',
		formatMatcher: 'best fit', hour: '2-digit', minute: '2-digit', second: '2-digit'
	})
	*/
	
})

document.addEventListener('DOMContentLoaded', () => {
	document.head.append(style);
	document.body.append(wrapper);
	let updateButton = wrapper.querySelector('.update_history_button');
	console.log('updateButton',updateButton)
	updateButton.onclick = () => {
		console.log('111')
		ipcRenderer.send('startUpdateDownloaded');
	}
})

