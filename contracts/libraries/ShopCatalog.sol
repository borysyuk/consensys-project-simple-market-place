pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/AutoIncrementing.sol";

import "contracts/libraries/List.sol";

/**
 * @title List of shops library
 * @author Ihor Borysyuk
 * @dev This library based on List and ProductCatalog libraries and implemets two way list to store shops.
 *      You can add/remove shops and "walk" in two directions
 */
library ShopCatalog {

    using SafeMath for uint;
    using SafeMath for uint32;
    using List for List.ListData;
    using AutoIncrementing for AutoIncrementing.Counter;

    struct Shop {
        uint id;
        address contractAddress;
        bool exists;
    }

    struct ShopList {
        AutoIncrementing.Counter autoIncrementGenerator;
        uint count;
        mapping (uint => Shop) shops;
        List.ListData list;
    }

    /**
    * @dev Checks if shop id is in catalog.
    * @param _shopId shop id.
    * //revert
    */
    modifier shouldExists(ShopList storage self, uint _shopId) {
        require(self.shops[_shopId].exists, "Shop should be exists");
        _;
    }

    /**
    * @dev Add a new shop into catalog.
    * @param _contractAddress address of shop contract.
    * @return (uint id)
    */
    function add(ShopList storage self, address _contractAddress) internal  returns (uint id){
        id = self.autoIncrementGenerator.nextId();
        Shop memory shop = Shop(id, _contractAddress, true);
        self.shops[id] = shop;
        self.count = self.count.add(1);
        self.list.add(id);
    }

    /**
    * @dev Remove a shop from catalog.
    * @param _shopId id of shop into catalog.
    * //revert
    */
    function remove(ShopList storage self, uint _shopId) internal shouldExists(self, _shopId) {
        delete self.shops[_shopId];
        self.count = self.count.sub(1);
        self.list.remove(_shopId);
    }

    /**
    * @dev Get a shop info from catalog.
    * @param _shopId id of shop into catalog.
    * //revert
    */
    function get(ShopList storage self, uint _shopId) internal view shouldExists(self, _shopId)
        returns (
            uint id,
            address contractAddress,
            bool exists
        )
    {
        Shop storage myShop = self.shops[_shopId];
        return (
            myShop.id,
            myShop.contractAddress,
            myShop.exists
        );
    }

    /**
    * @dev Get next shop from catalog.
    * @param _shopId id of shop into catalog, or 0 if you want to get first one.
    * @return (uint id, address contractAddress, bool exists)
    * //revert
    */
    function getNextShop(ShopList storage self, uint _shopId) internal view returns (uint id, address contractAddress, bool exists) {
        uint nextShopId = self.list.getNextId(_shopId);

        return get(self, nextShopId);
    }

    /**
    * @dev Get prev shop from catalog.
    * @param _shopId id of shop into catalog, or 0 if you want to get last one.
    * @return (uint id, address contractAddress, bool exists)
    * //revert
    */
    function getPrevShop(ShopList storage self, uint _shopId) internal view returns (uint id, address contractAddress, bool exists) {
        uint prevShopId = self.list.getPrevId(_shopId);

        return get(self, prevShopId);
    }

    /**
    * @dev Get count of shop into catalog.
    * @return (uint)
    */
    function shopsCount(ShopList storage self) internal view returns (uint) {
        return self.count;
    }
}
