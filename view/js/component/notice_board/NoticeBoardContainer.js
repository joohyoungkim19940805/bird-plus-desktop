export default new class NoticeBoardContainer{

	#contentList;
	#wrap = (() => {
		let wrap = Object.assign(document.createElement('div'), {
			id: 'notice_board_wrapper',
			innerHTML: '<div class="content"></div>'
		});
		wrap.dataset.is_resize = true;
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
		this.#wrap.querySelector('.content').append(this.#container);
	}

	get container(){
		return this.#container;
	}
	get wrap(){
		return this.#wrap;
	}
}