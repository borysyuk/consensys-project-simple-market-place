pragma solidity 0.4.24;

import "../ProductCatalog.sol";

/**
 * @title ProductCatalogMock
 * @author Ihor Borysyuk
 * @dev Mock contract to test ProductCatalog library. All docs are into origin library
 */
contract ProductCatalogMock {

    using ProductCatalog for ProductCatalog.ProductList;

    ProductCatalog.ProductList private products;

    function add(string _name, uint _price, uint32 _quantity, string _image) external {
        products.add(_name, _price, _quantity, _image);
    }

    function remove(uint _productId) external {
        products.remove(_productId);
    }

    function update(uint _productId, string _name, uint _price, uint32 _quantity, string _image) external {
        products.update(_productId, _name, _price, _quantity, _image);
    }

    function decQuantity(uint _productId, uint32 _quantity) external {
        products.decQuantity(_productId, _quantity);
    }

    function incQuantity(uint _productId, uint32 _quantity) external {
        products.incQuantity(_productId, _quantity);
    }

    function get(uint _productId) public view
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        return products.get(_productId);
    }

    function getNextProduct(uint _productId) external view
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        return products.getNextProduct(_productId);
    }

    function getPrevProduct(uint _productId) external view
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        return products.getPrevProduct(_productId);
    }

    function productsCount() external view returns (uint) {
        return products.productsCount();
    }
}
