import HeaderDefault from "@component/header/HeaderDefault";

window.customElements.define('header-default', HeaderDefault);

new class LoginPageRenderer{
	constructor(){
		let loginBtn = document.getElementById('login_btn');
		let statusText = document.querySelector('.status_text');
		loginBtn.onclick = (event) =>{
			statusText.textContent = '';
			let param = [...document.forms.login_form].reduce( (obj, e, i) => {
				obj[e.name] = e.value
				return obj;
			}, {});

			window.myAPI.account.loginProcessing(param).then(response=>{
				console.log('response',response);
				let {code} = response;
				if(code == 0){
					window.myAPI.pageChange.changeWokrspacePage();
				}else if(code == 101){
					statusText.textContent = '해당 기능에 권한이 없습니다.'
				}else if(code == 102){
					statusText.textContent = '계정 정보가 잘못되었습니다.'
				}else if(code == 103){
					statusText.textContent = '계정 정보가 잘못되었습니다.'
				}else if(code == 104){
					statusText.textContent = '비활성화 된 계정입니다.'
				}else if(code == 999){
					statusText.textContent = '알 수 없는 오류입니다. 관리자에게 문의하십시오.';
				}else{
					statusText.textContent = '서버로부터 응답이 없습니다.';
				}
			});

			event.target.removeAttribute('data-is_disabled');
		}
		document.querySelector('.login_wrap').onkeyup = (event) =>{
			statusText.textContent = '';
			if(event.key == 'Enter'){
				loginBtn.onclick(event);
			}
		}
	}
}();