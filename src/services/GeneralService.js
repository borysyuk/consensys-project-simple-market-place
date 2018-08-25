import Storage from './StorageService';

class GeneralService {

    constructor () {
        this.transactionsHistory = {};
    }

    getCurrentAccount() {
        return new Promise((resolve, reject) => {
            Storage.web3.eth.getAccounts((error, accounts) => {
                if (error) {
                    reject(error);
                }
                resolve(accounts[0]);
            })
        });
    }

    dispatchEventHandler(eventError, eventResult, eventHandler) {

    }
}

export default new GeneralService();