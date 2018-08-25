class StorageService {

    constructor (){
        this.web3 = null;
        this.simpleMarketPlaceContract = null;
        this.simpleShopContract = null;
    }

    set(key, value) {
        this[key] = value;
    }
}

export default new StorageService();