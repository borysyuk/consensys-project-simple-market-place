let SimpleMarketPlace = artifacts.require("./SimpleMarketPlace.sol");
let SimpleShopFactoryLibrary = artifacts.require("./libraries/SimpleShopFactory.sol");

module.exports = function(deployer, network, accounts) {

    return deployer.deploy(SimpleShopFactoryLibrary).then(() => {
        deployer.link(
            SimpleShopFactoryLibrary,
            [SimpleMarketPlace]
        );
        return deployer.deploy(SimpleMarketPlace);
    })
};
