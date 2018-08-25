import Storage from './StorageService';

function convertShop(solidityResult) {
    return {
        address: solidityResult[0],
        id: solidityResult[1],
        name: solidityResult[2],
        description: solidityResult[3],
        logo: solidityResult[4]
    }
}


class SimpleMarketPlaceService {

    getRoles() {
        return Storage.simpleMarketPlaceContract.getRoles().then(roles => {
            return {
                isMarketOwner: roles[0],
                isAdmin: roles[1],
                isShopOwner: roles[2]
            }
        });
    }

    addAdmin(address) {
        return Storage.simpleMarketPlaceContract.addAdmin(address)
    }

    removeAdmin(address) {
        return Storage.simpleMarketPlaceContract.removeAdmin.estimateGas(address).then((gas) => {
            return Storage.simpleMarketPlaceContract.removeAdmin(address, {gas: gas+100000});
        });

    }

    addShopOwner(address) {
        return Storage.simpleMarketPlaceContract.addShopOwner(address)
    }

    removeShopOwner(address) {
        return Storage.simpleMarketPlaceContract.removeShopOwner.estimateGas(address).then((gas) => {
            return Storage.simpleMarketPlaceContract.removeShopOwner(address, {gas: gas + 100000});
        })
    }

    isAdmin(address) {
        return Storage.simpleMarketPlaceContract.isAdmin(address)
    }

    isShopOwner(address) {
        return Storage.simpleMarketPlaceContract.isShopOwner(address)
    }

    isShopCreatedByUser(shopAddress, userAddress) {
        return Storage.simpleMarketPlaceContract.isShopCreatedByUser(shopAddress, userAddress)
    }

    // getShop(shopId) {
    //     return Storage.simpleMarketPlaceContract.getShop()
    // }

    getNextShop(fromShopId) {
        return Storage.simpleMarketPlaceContract.getNextShop(fromShopId).then(shopInfo => {
            return convertShop(shopInfo);
        })
    }

    getMyNextShop(fromShopId) {
        return Storage.simpleMarketPlaceContract.getMyNextShop(fromShopId).then(shopInfo => {
            return convertShop(shopInfo);
        })
    }

    _getNextShops(functionName, fromShopId, count, getShopCallBack) {
        return (this[functionName])(fromShopId)
            .then(shop => {
                getShopCallBack(shop);
                count--;
                if (count > 0) {
                    return this._getNextShops(functionName, shop.id, count, getShopCallBack)
                }
            });
    }

    _getShops(functionName, fromShopId, count) {
        let results = [];
        return new Promise((resolve, reject) => {
            this._getNextShops(functionName, fromShopId, count, (shop) => {
                console.log('get shop');
                console.log(shop);
                results.push(shop);
                if (results.length === count) {
                    resolve(results);
                }
            }).catch(error => {
                console.log('get shop error2');
                console.log(error);
                resolve(results);
            });
        })
    }

    getShops(fromShopId, count) {
        return this._getShops('getNextShop', fromShopId, count);
    }

    getMyShops(fromShopId, count) {
        return this._getShops('getMyNextShop', fromShopId, count);
    }

    shopsCount() {
        return Storage.simpleMarketPlaceContract.shopsCount();
    }

    myShopsCount() {
        return Storage.simpleMarketPlaceContract.myShopsCount();
    }

    createShop(name, description, logo) {
        return Storage.simpleMarketPlaceContract.createShop(name, description, logo);
    }

    removeShop(shopId) {
        return Storage.simpleMarketPlaceContract.removeShop.estimateGas(shopId).then((gas) => {
            return Storage.simpleMarketPlaceContract.removeShop(shopId, {gas: gas+100000});
        });
    }
}

export default new SimpleMarketPlaceService();