import SimpleShopArtifacts from '../../build/contracts/SimpleShop.json';
import Storage from './StorageService';


function convertShop(solidityResult) {
    console.log(solidityResult);
    return {
        name: solidityResult[0],
        description: solidityResult[1],
        logo: solidityResult[2]
    }
}

function convertProduct(solidityResult) {
    return {
        id: parseInt(solidityResult[0].toString(), 10),
        name: solidityResult[1],
//        price: parseFloat(solidityResult[2].toString()),
        price: Storage.web3.fromWei(solidityResult[2].toString()),
        quantity: parseInt(solidityResult[3].toString(), 10),
        image: solidityResult[4]
    }
}

class SimpleShopService {

    initSimpleShopContract(address) {
        return new Promise((resolve, reject) => {
            const contract = require('truffle-contract');
            let SimpleShopContract = contract(SimpleShopArtifacts);
            SimpleShopContract.setProvider(Storage.web3.currentProvider);

            resolve(new SimpleShopContract(address));
        });
    }

    productsCount() {
        return Storage.simpleShopContract.productsCount();
    }

    getProduct(id) {
        return Storage.simpleShopContract.getProduct(id).then(result => {
            return convertProduct(result);
        })
    }

    getShopInfo() {
        return Storage.simpleShopContract.getShopInfo().then( result => {
           return convertShop(result);
        });
    }

    addProduct(name, price, quantity, image) {
        return Storage.simpleShopContract.addProduct(name, Storage.web3.toWei(price), quantity, image);
    }

    removeProduct(id) {
        return Storage.simpleShopContract.removeProduct.estimateGas(id).then((gas) => {
            return Storage.simpleShopContract.removeProduct(id, {gas: gas+100000});
        });
    }

    updateProduct(id, name, price, quantity, image) {
        return Storage.simpleShopContract.updateProduct(id, name, Storage.web3.toWei(price), quantity, image);
    }

    buyProduct(id, quantity) {
        return this.getProduct(id).then(product => {
            return Storage.simpleShopContract.buyProduct.estimateGas(id, quantity, {value: Storage.web3.toWei(product.price * quantity)}).then((gas) => {
                return Storage.simpleShopContract.buyProduct(id, quantity, {value: Storage.web3.toWei(product.price * quantity), gas: gas+100000});
            });
        });
    }

    withdraw(funds) {
        return Storage.simpleShopContract.withdraw(Storage.web3.toWei(funds));
    }

    getShopBalance(address) {
        return new Promise((resolve, reject) => {
            Storage.web3.eth.getBalance(
                address,
                (e, r) => {
                    if (e) {
                        reject(e)
                    } else {
                        resolve(parseFloat(Storage.web3.fromWei(r).toString()))
                    }
                }
            )
        });
    }

    getNextProduct(fromProductId) {
        return Storage.simpleShopContract.getNextProduct(fromProductId).then(productInfo => {
            return convertProduct(productInfo);
        })
    }

    _getNextProducts(fromProductId, count, getProductCallBack) {
        return this.getNextProduct(fromProductId)
            .then(product => {
                getProductCallBack(product);
                count--;
                if (count > 0) {
                    return this._getNextProducts(product.id, count, getProductCallBack)
                }
            });
    }

    _getProducts(fromProductId, count) {
        let results = [];
        return new Promise((resolve, reject) => {
            this._getNextProducts(fromProductId, count, (product) => {
                console.log('get product');
                console.log(product);
                results.push(product);
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

    getProducts(fromShopId, count) {
        return this._getProducts(fromShopId, count);
    }

}

export default new SimpleShopService();