import noticeBoardList from "./notice_board_item/NoticeBoardList"
import noticeBoardDetail from "./notice_board_item/NoticeBoardDetail"

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
		noticeBoardDetail.element.dataset.is_resize = true;
		noticeBoardDetail.element.dataset.grow = 0;
		noticeBoardDetail.element.dataset.prev_grow = 1.5;

		this.#contentList = [noticeBoardList.element, noticeBoardDetail.element];
		
		this.#container.replaceChildren(...this.#contentList);
		this.#wrap.querySelector('.content').append(this.#container);

		this.#wrap._openEndCallBack = () => {
			noticeBoardList.refresh();
		}
	}

	get container(){
		return this.#container;
	}
	get wrap(){
		return this.#wrap;
	}
}