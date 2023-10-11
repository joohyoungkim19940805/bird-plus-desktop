import noticeBoardList from "./notice_board_item/NoticeBoardList"
export default new class NoticeBoardContainer{

	#contentList;
	#wrap = (() => {
		let wrap = Object.assign(document.createElement('div'), {
			id: 'notice_board_wrapper',
			innerHTML: '<div class="content"></div>'
		});
		wrap.dataset.is_resize = false;
		wrap.dataset.grow = 0;
		return wrap
	})();
	#container = (() => {
		let noticeBoardContainer = Object.assign(document.createElement('flex-layout'), {

		});
		noticeBoardContainer.dataset.direction = 'column';
		return noticeBoardContainer;
	})();
	constructor(){
		noticeBoardList.element.dataset.is_resize = true;
		this.#contentList = [noticeBoardList.element];
		
		this.#container.replaceChildren(...this.#contentList);
		this.#wrap.querySelector('.content').append(this.#container);
	}

	get container(){
		return this.#container;
	}
	get wrap(){
		return this.#wrap;
	}
}