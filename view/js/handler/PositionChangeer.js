export default class PositionChanger{
	#wrapper;
	#targetItem;
	#childList = [];
	#onDropEndChangePositionCallback = (changeList) => {};
	#onDropDocumentOutCallback = (target) => {console.log('out!!')}; 
	#onIfCancelCallBack = (target) => {return false;};
	constructor({wrapper}){
		if( ! wrapper){
			throw new Error('wrapper is undefined');
		}/*else if(childList.length == 0){
			throw new Error('child list is empty');
		}*/
		this.#wrapper = wrapper;
	}

	addPositionChangeEvent(child, wrapper){
		if(child.length == 0){
			throw new Error('child is empty');
		}else if(child.some(e=>Number(e.dataset.order_sort) == undefined || isNaN(Number(e.dataset.order_sort)))){
			throw new Error('data-order_sort is not defined or is not number')
		}
		let parent = wrapper || this.#wrapper;
		return new Promise(resolve => {
			
			let lastItem = [...parent.children].filter(e=>e.hasAttribute('data-order_sort')).pop() // or at(-1)
			child.forEach((item, index)=>{
				item.draggable = true;
				item.ondragstart = (event) => {
					event.stopPropagation();
					//event.preventDefault();
					this.#targetItem = item;
					//this.#targetItem = event.target;
					child.forEach(async e => {
						[...e.children].forEach((ee)=>{
							if(ee.tagName == 'UL') return;
							ee.style.pointerEvents = 'none';
						})
					})
				}
				item.ondragend = (event) => {
					event.stopPropagation();
					//event.preventDefault();
					if(
						event.x < 0 || event.y < 0 ||
						window.outerWidth < event.x || window.outerHeight < event.y
					){
						this.#onDropDocumentOutCallback(item);
					}
					this.#targetItem = undefined;
					child.forEach(async e => {
						[...e.children].forEach((ee)=>{
							if(ee.tagName == 'UL') return;
							ee.style.pointerEvents = '';
						})
					})
				}
				item.ondragover = (event) => {
					event.stopPropagation();
					event.preventDefault();
				}
				item.ondragenter = (event) => {
					event.stopPropagation();
					event.preventDefault();
					event.target.style.borderTop = 'solid #0000009c';
				}
				item.ondragleave = (event) => {
					event.stopPropagation();
					event.preventDefault();
					event.target.style.borderTop = '';
				}
				item.ondrop = (event) => {
					event.stopPropagation();
					event.preventDefault();
					event.target.style.borderTop = '';
					if(! this.#targetItem){
						return;
					}
					//return;
					let target = this.#targetItem;
					let cancle = this.onIfCancelCallBack(target, item)
					if((typeof cancle) != 'boolean'){
						throw new Error('onIfCancelCallBack is only return Boolean');
					}else if(cancle){
						return;
					}
					//item.before(target);
					event.target.closest('[data-order_sort]').before(target);
					this.#targetItem = undefined;
					new Promise(res=>{
						let nowLastItem = [...parent.children].filter(e=>e.hasAttribute('data-order_sort')).pop(); // or at(-1)
						//let nowLastItem = [...target.closest('ul').children].filter(e=>e.hasAttribute('data-order_sort')).pop(); // or at(-1)
						//this.#wrapper.querySelector('[data-order_sort]:last-child');
						if( ! lastItem){
							lastItem = nowLastItem;
						}
						let prevOrderSort = Number(lastItem.dataset.order_sort);
						if(target == lastItem && lastItem != nowLastItem){
							nowLastItem.dataset.order_sort = lastItem.dataset.order_sort;
							prevOrderSort = Number(lastItem.dataset.order_sort);
							//prevOrderSort -= 1;
						}
						lastItem = nowLastItem
						let prevItem = lastItem?.previousElementSibling;
						while(prevItem){
							prevOrderSort += 1;
							prevItem.dataset.prev_order_sort = prevItem.dataset.order_sort
							prevItem.dataset.order_sort = prevOrderSort ;
							if(prevItem.previousElementSibling === prevItem){
								break;
							}
							prevItem = prevItem.previousElementSibling;
						}
						res();
					}).then(()=>{
						this.#onDropEndChangePositionCallback(
							[...child.filter(e=>e.dataset.order_sort != e.dataset.prev_order_sort && e != target), target],
							{item, target, parent}
						)
					})
				}
			})
			resolve();
		});
	}

	set onDropEndChangePositionCallback(callBack){
		this.#onDropEndChangePositionCallback = callBack;
	}
	get onDropEndChangePositionCallback(){
		return this.#onDropEndChangePositionCallback;
	}

	set onDropDocumentOutCallback(callBack){
		this.#onDropDocumentOutCallback = callBack;
	}
	get onDropDocumentOutCallback(){
		return this.#onDropDocumentOutCallback;
	}

	set onIfCancelCallBack(callBack){
		this.#onIfCancelCallBack = callBack
	}
	get onIfCancelCallBack(){
		return this.#onIfCancelCallBack;
	}

}