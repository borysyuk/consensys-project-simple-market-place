pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/libraries/SimpleShopFactory.sol";
import "../../contracts/SimpleShop.sol";

contract TestSimpleShopFactoryLibrary {

    function testCreate() public {

        string memory name = "Test shop";
        string memory description = "Test description";
        string memory logo = "Test Logo";

        address shop_address = SimpleShopFactory.create(name, description, logo);
        SimpleShop shop = SimpleShop(shop_address);

        // Assert
        Assert.equal(shop.name(), name, "Name should match");
        Assert.equal(shop.description(), description, "Description should match");
        Assert.equal(shop.logo(), logo, "Logo should match");
        Assert.equal(shop.owner(), msg.sender, "Sender should match");
    }
}
