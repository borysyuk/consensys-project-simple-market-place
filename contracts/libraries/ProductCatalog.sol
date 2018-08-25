pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/AutoIncrementing.sol";

import "contracts/libraries/List.sol";

/**
 * @title List of products library
 * @author Ihor Borysyuk
 * @dev This library based on List library and implemets two way list to store products.
 *      You can add/remove products and "walk" in two directions
 */
library ProductCatalog {

    using SafeMath for uint;
    using SafeMath for uint32;
    using List for List.ListData;
    using AutoIncrementing for AutoIncrementing.Counter;

    struct Product {
        uint id;
        string name;
        uint price; //in wei
        uint32 quantity;
        string image;
        bool exists;
    }

    struct ProductList {
        AutoIncrementing.Counter autoIncrementGenerator;
        uint count;
        mapping (uint => Product) products;
        List.ListData list;
    }

    /**
    * @dev Checks if product id is in catalog.
    * @param _productId product id.
    * //revert
    */
    modifier shouldExists(ProductList storage self, uint _productId) {
        require(self.products[_productId].exists, "ProductId should be exists");
        _;
    }

    /**
    * @dev Add a product to catalog.
    * @param _name product name.
    * @param _price product price.
    * @param _quantity product quantity.
    * @param _image product image url.
    * @return (uint id)
    * //revert
    */
    function add(ProductList storage self, string _name, uint _price, uint32 _quantity, string _image) internal  returns (uint id){
        require(_price > 0, "Price should be > 0.");
        id = self.autoIncrementGenerator.nextId();
        Product memory product = Product(id, _name, _price, _quantity, _image, true);
        self.products[id] = product;
        self.count = self.count.add(1);
        self.list.add(id);
    }

    /**
    * @dev Remove a product from catalog.
    * @param _productId product id.
    * //revert
    */
    function remove(ProductList storage self, uint _productId) internal shouldExists(self, _productId) {
        delete self.products[_productId];
        self.count = self.count.sub(1);
        self.list.remove(_productId);
    }

    /**
    * @dev Get a product from catalog.
    * @param _productId product id.
    * @return (uint id, string name, uint price, uint32 quantity, string image, bool exists)
    */
    function get(ProductList storage self, uint _productId) internal view shouldExists(self, _productId)
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        Product storage myProduct = self.products[_productId];
        return (
            myProduct.id,
            myProduct.name,
            myProduct.price,
            myProduct.quantity,
            myProduct.image,
            myProduct.exists
        );
    }

    /**
    * @dev Update a product info.
    * @param _productId product id.
    * @param _name product name.
    * @param _price product price.
    * @param _quantity product quantity.
    * @param _image product image url.
    * //revert
    */
    function update(ProductList storage self, uint _productId, string _name, uint _price, uint32 _quantity, string _image)
        internal shouldExists(self, _productId)
    {
        require(_price > 0, "Price should be > 0.");

        Product storage myProduct = self.products[_productId];
        myProduct.name = _name;
        myProduct.price = _price;
        myProduct.quantity = _quantity;
        myProduct.image = _image;
    }

    /**
    * @dev Decrease a product quantity.
    * @param _productId product id.
    * @param _quantity product quantity.
    * //revert
    */
    function decQuantity(ProductList storage self, uint _productId, uint32 _quantity) internal shouldExists(self, _productId) {
        Product storage myProduct = self.products[_productId];
        require(myProduct.quantity >= _quantity, "quantity of product should be >= 0.");
        myProduct.quantity = uint32(myProduct.quantity.sub(_quantity));
    }

    /**
    * @dev Increase a product quantity.
    * @param _productId product id.
    * @param _quantity product quantity.
    * //revert
    */
    function incQuantity(ProductList storage self, uint _productId, uint32 _quantity) internal shouldExists(self, _productId) {
        Product storage myProduct = self.products[_productId];
        myProduct.quantity = uint32(myProduct.quantity.add(_quantity));
    }

    /**
    * @dev Get a next product from catalog.
    * @param _productId product id.
    * @return (uint id, string name, uint price, uint32 quantity, string image, bool exists)
    */
    function getNextProduct(ProductList storage self, uint _productId) internal view
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        uint nextProductId = self.list.getNextId(_productId);

        return get(self, nextProductId);
    }

    /**
    * @dev Get a prev product from catalog.
    * @param _productId product id.
    * @return (uint id, string name, uint price, uint32 quantity, string image, bool exists)
    */
    function getPrevProduct(ProductList storage self, uint _productId) internal view
        returns (
            uint id,
            string name,
            uint price,
            uint32 quantity,
            string image,
            bool exists
        )
    {
        uint prevProductId = self.list.getPrevId(_productId);

        return get(self, prevProductId);
    }

    /**
    * @dev Returns count of product
    * @return (uint id)
    */
    function productsCount(ProductList storage self) internal view returns (uint) {
        return self.count;
    }
}
