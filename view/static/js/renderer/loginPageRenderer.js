
new class LoginPageRenderer{
	constructor(){
		console.log(document.getElementById('login_btn'));
		document.getElementById('login_btn').onclick = e =>{
			let param = [...document.forms.login_form].reduce( (obj, e, i) => {
				obj[e.name] = e.value
				return obj;
			}, {});
			console.log(param);
		}
	}
}();