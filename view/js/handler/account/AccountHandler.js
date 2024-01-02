export const accountHandler = new class AccountHandler{
    #accountInfo = this.searchAccountInfo();
    static #accountInfoChangeAcceptResolve;
    static accountInfoChangeAcceptPromise = new Promise(resolve => {
        this.#accountInfoChangeAcceptResolve = resolve;
    });

    static {
        window.myAPI.event.electronEventTrigger.addElectronEventListener('accountInfoChangeAccept', data => {
            console.log(data);
            let {content} = data;
            this.#accountInfoChangeAcceptResolve(content);
            this.accountInfoChangeAcceptPromise = new Promise(resolve=>{
                this.#accountInfoChangeAcceptResolve = resolve;
            })
        })
    }

    constructor(){

    }

    accountInfoChangeAcceptEventListener(callback = ({oldData, newData}) => {}){
        let oldData = undefined;
		let newData = undefined;
		const simpleObserver = () => {
			AccountHandler.accountInfoChangeAcceptPromise.then((event)=>{
				newData = event;
				callback({oldData, newData});
				oldData = event;
				simpleObserver();
			})
		}
		simpleObserver();
    }

    async searchAccountInfo(){
        this.#accountInfo = await window.myAPI.account.getAccountInfo().then(result => {
            return result.data;
        });
        return this.#accountInfo;
    }

    get accountInfo(){
        return this.#accountInfo;
    }

};