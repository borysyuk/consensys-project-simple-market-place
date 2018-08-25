pragma solidity 0.4.24;

import "../SimpleShop.sol";

/**
 * @title SimpleShopFactory
 * @author Ihor Borysyuk
 * @dev Create an instance of SimpleShop
 */
library SimpleShopFactory {

    /**
    * @dev Create a new SimpleShop.
    * @param _name SimpleShop name.
    * @param _description SimpleShop description.
    * @param _logo SimpleShop logo url.
    * @return address
    */
    function create(string _name, string _description, string _logo)
        external
        returns (address)
    {
        SimpleShop shop = new SimpleShop(_name, _description, _logo);
        shop.transferOwnership(address(msg.sender));
        return address(shop);
    }
}
