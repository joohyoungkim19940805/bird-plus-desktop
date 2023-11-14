export const accountHandler = new class AccountHandler{
    #accountInfo = window.myAPI.account.getAccountInfo().then(result => {
        return result.data;
    });
    constructor(){
        
    }

    get accountInfo(){
        return this.#accountInfo;
    }
};