import Quill from "quill"

const quill = new Quill('#editor', {
	debug: 'info',
	modules: {
	  toolbar: true
	},
	placeholder: 'Compose an epic...',
	readOnly: true,
	theme: 'snow'
  });