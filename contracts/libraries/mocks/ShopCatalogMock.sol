pragma solidity 0.4.24;

import "../ShopCatalog.sol";

/**
 * @title ShopCatalogMock
 * @author Ihor Borysyuk
 * @dev Mock contract to test ShopCatalog library. All docs are into origin library
 */
contract ShopCatalogMock {

    using ShopCatalog for ShopCatalog.ShopList;

    ShopCatalog.ShopList private shops;

    function add(address _contractAddress) external {
        shops.add(_contractAddress);
    }

    function remove(uint _shopId) external {
        shops.remove(_shopId);
    }

    function get(uint _shopId) public view returns (uint id, address contractAddress, bool exists) {
        return shops.get(_shopId);
    }

    function getNextShop(uint _shopId) external view returns (uint id, address contractAddress, bool exists) {
        return shops.getNextShop(_shopId);
    }

    function getPrevShop(uint _shopId) external view returns (uint id, address contractAddress, bool exists) {
        return shops.getPrevShop(_shopId);
    }

    function shopsCount() external view returns (uint) {
        return shops.shopsCount();
    }
}
