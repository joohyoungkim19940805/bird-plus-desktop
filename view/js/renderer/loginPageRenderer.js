
new class LoginPageRenderer{
	constructor(){
		console.log(document.getElementById('login_btn'));
		let loginBtn = document.getElementById('login_btn');
		let statusText = document.querySelector('.status_text');
		loginBtn.onclick = (event) =>{
			statusText.textContent = '';
			let param = [...document.forms.login_form].reduce( (obj, e, i) => {
				obj[e.name] = e.value
				return obj;
			}, {});
			console.log(window.myAPI.account)
			console.log(window.myAPI)
			console.log(window.myAPI.pageChange.changeMainPage());
			
			window.myAPI.account.loginProc(param).then(response=>{
				console.log(response);
				let {code} = response;
				if(code == '00'){
					window.myAPI.pageChange.changeMainPage();
				}else if(code == 101){
					statusText.textContent = '해당 기능에 권한이 없습니다.'
				}else if(code == 102){
					statusText.textContent = '유효하지 않은 비밀번호입니다.'
				}else if(code == 103){
					statusText.textContent = '존재하지 않는 계정입니다.'
				}else if(code == 104){
					statusText.textContent = '비활성화 된 계정입니다.'
				}else if(code == 999){
					statusText.textContent = '알 수 없는 오류입니다. 관리자에게 문의하십시오.';
				}
			});

			event.target.removeAttribute('data-is_disabled');
		}
		document.querySelector('.login_wrap').onkeyup = (event) =>{
			statusText.textContent = '';
			console.log(event.key);
			if(event.key == 'Enter'){
				loginBtn.onclick(event);
			}
		}
	}
}();