export default class PositionChanger{
	#wrapper;
	#targetItem;
	#childList = [];
	#onDropEndChangePositionCallback = (changeList) => {};
	#onDropDocumentOutCallback = (target) => {}; 
	constructor({wrapper}){
		if( ! wrapper){
			throw new Error('wrapper is undefined');
		}/*else if(childList.length == 0){
			throw new Error('child list is empty');
		}*/
		this.#wrapper = wrapper;
	}

	addPositionChangeEvent(...child){
		if(child.length == 0){
			throw new Error('child is empty');
		}else if(child.some(e=>Number(e.dataset.order_sort) == undefined || isNaN(Number(e.dataset.order_sort)))){
			throw new Error('data-order_sort is not defined or is not number')
		}
		return new Promise(resolve => {
			
			let lastItem = [...this.#wrapper.children].filter(e=>e.hasAttribute('data-order_sort')).pop() // or at(-1)
			child.forEach((item, index)=>{
				item.draggable = true;
				item.dataset.is_position_change_target = '';
				item.ondragstart = (event) => {
					this.#targetItem = item;
				}
				item.ondragend = (event) => {
					console.log(event);
					if(event.x < 0 || event.y < 0){
						this.#onDropDocumentOutCallback(item);
					}
					this.#targetItem = undefined;
				}
				item.ondragover = (event) => {
					event.preventDefault();
				}
				
				item.ondragenter = (event) => {
					item.style.borderTop = 'solid #0000009c';
				}

				item.ondragleave = (event) => {
					item.style.borderTop = '';
				}

				item.ondrop = (event) => {
					item.style.borderTop = '';
					if(! this.#targetItem){
						return;
					}
					let target = this.#targetItem;
					item.before(target);
					this.#targetItem = undefined;
					new Promise(res=>{
						let nowLastItem = [...this.#wrapper.children].filter(e=>e.hasAttribute('data-order_sort')).pop(); // or at(-1)
						//this.#wrapper.querySelector('[data-order_sort]:last-child');
						let prevOrderSort = Number(lastItem.dataset.order_sort);
						if(target == lastItem && lastItem != nowLastItem){
							nowLastItem.dataset.order_sort = lastItem.dataset.order_sort;
							prevOrderSort = Number(lastItem.dataset.order_sort);
							//prevOrderSort -= 1;
						}
						lastItem = nowLastItem
						let prevItem = lastItem.previousElementSibling;
						let updateList = [];
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
							child.filter(e=>e.dataset.order_sort != e.dataset.prev_order_sort).map(e=>{
								let obj = Object.assign({}, e.dataset);
								return Object.entries(obj).reduce((total, [k,v]) => {
									let key = k.split('_').map((e, i) => i == 0 ? e : e.charAt(0).toUpperCase() + e.substring(1)).join('');
									total[key] = v;
									return total;
								}, {})
								/*return {
									id: e.dataset.id, 
									roomId: e.dataset.room_id, 
									orderSort: e.dataset.order_sort,
								};*/
							})
						)
					})
					/*console.log(child);
					console.log(index);
					let targetIndex = child.findIndex(e=>e==target);
					let sortList = [...child.slice(targetIndex +1, index), target, item, ...child.slice(index + 1)]
					let lastOrderSortNumberOfDesc = Number(child[child.length - 1].dataset.order_sort);
					console.log(sortList)
					//sortList.unshift(item)
					console.log(sortList.map(e=>e.dataset.order_sort));
					console.log();
					sortList.reverse().forEach((e,i)=>{
						e.dataset.order_sort = lastOrderSortNumberOfDesc + i
					})*/
					//cloneList.sort((a,b)=>{
					//	return Number(a.dataset.order_sort) - Number(b.dataset.order_sort) 
					//})

					/*
					cloneList.reverse().forEach((e,i)=>{
						console.log(lastOrderSortNumberOfDesc,' ',i)
						console.log('start! ',e.dataset.order_sort)
						e.dataset.order_sort = lastOrderSortNumberOfDesc + i
						console.log('end! ',e.dataset.order_sort)
						console.log(e);
					})
					*/
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

}