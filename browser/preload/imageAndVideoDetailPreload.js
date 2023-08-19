
document.addEventListener('DOMContentLoaded', () => {
	document.head.append(
		Object.assign(document.createElement('style'), {
			textContent : `
				kbd {
					background-color: #eee;
					border-radius: 3px;
					border: 1px solid #b4b4b4;
					box-shadow:
					0 1px 1px rgba(0, 0, 0, 0.2),
					0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
					color: #333;
					display: inline-block;
					font-size: 0.85em;
					font-weight: 700;
					line-height: 1;
					padding: 2px 4px;
					white-space: nowrap;
				}
			`
		})
	);
	let image = document.querySelector('img');
	image.style.zoom = '100%';
	let div = Object.assign(document.createElement('div'),{
		innerHTML: `
			<p>
				<kbd>Ctrl</kbd> + <kbd>-</kbd>  OR  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>+</kbd>
			</p>
			<br>
			<div style="width: 100%;display: flex;justify-content: flex-end;padding-bottom: 2%;gap: 2vw;">
				Mouse Zoom Mode Change : 
				<div>
					<label for="img-zoom-in" style="border: outset;">+</label>
					<input type="radio" id="img-zoom-in" name="img-zoom" hidden/>
				</div>
				<div>
					<label for="img-zoom-out" style="border: outset;">-</label>
					<input type="radio" id="img-zoom-out" name="img-zoom" hidden/>
				</div>
			</div>
			`
	});
	Object.assign(div.style, {
		position: 'sticky',
		top:0,
		color: 'white'
	})
	/*
	Object.assign(div.style, {
		width: '100%',
		display: 'flex',
		background: '#d5d5d5',
		justifyContent: 'flex-end',
		padding: '15%',
		gap: '2vw'
	})
	*/
	window.document.body.prepend(div);
	let zoomStatus = '';
	div.onchange = (event) => {
		if(event.target.id == 'img-zoom-in'){
			image.style.cursor = 'zoom-in';
			zoomStatus = 'in'
			
		}else if(event.target.id == 'img-zoom-out'){
			image.style.cursor = 'zoom-out';
			zoomStatus = 'out'
		}
		console.log(event.target);
		div.querySelectorAll('#img-zoom-in, #img-zoom-out').forEach(e=>{
			if(e == event.target){
				event.target.labels[0].style.border = 'groove'
			}else{
				e.labels[0].style.border = 'outset'
			}
		})
	}

	image.onclick = () => {
		if(zoomStatus === ''){
			return;
		}
		let zoomValue = parseInt(image.style.zoom);
		if(zoomStatus === 'in'){
			zoomValue += 25;
		}else{
			zoomValue -= 25;
		}
		image.style.zoom = `${zoomValue}%`;
	}

})
//document.querySelector('img').style = 