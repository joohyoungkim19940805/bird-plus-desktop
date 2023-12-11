export const accountHandler = new class AccountHandler{
    #accountInfo = this.searchAccountInfo();
    constructor(){

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