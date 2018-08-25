pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./libraries/ProductCatalog.sol";

/**
 * @title Simple Shop
 * @author Ihor Borysyuk
 * @dev Simple shop. Allows you add/remove/edit/sell products and withdraw a funds.
 */
contract SimpleShop is Ownable, Pausable, Destructible {

    using SafeMath for uint;
    using ProductCatalog for ProductCatalog.ProductList;

    string public name;
    string public description;
    string public logo;

    ProductCatalog.ProductList internal products;

    /**
    * @dev Event for adding a new product.
    * @param shopOwner Who add a new product (Indexed).
    * @param id product id.
    * @param name product name.
    * @param price product price.
    * @param quantity product quantity.
    * @param image product image url.
    */
    event ProductAdded(address indexed shopOwner, uint id, string name, uint price, uint quantity, string image);

    /**
    * @dev Event for removing a product.
    * @param shopOwner Who remove a product (Indexed).
    * @param id product id.
    */
    event ProductRemoved(address indexed shopOwner, uint id);

    /**
    * @dev Event for updating product.
    * @param shopOwner Who update a product (Indexed).
    * @param id product id.
    * @param name product name.
    * @param price product price.
    * @param quantity product quantity.
    * @param image product image url.
    */
    event ProductUpdated(address indexed shopOwner, uint id, string name, uint price, uint quantity, string image);

    /**
    * @dev Event for selling a product.
    * @param buyer Who buoght a product (Indexed).
    * @param funds sent funds.
    * @param id sold product id.
    * @param quantity sold product quantity.
    */
    event ProductBought(address indexed buyer, uint funds, uint id, uint quantity);

    /**
    * @dev Event for returning extra funds.
    * @param buyer Who buoght a product (Indexed).
    * @param extraFunds returned extra funds.
    * @param id sold product id.
    * @param quantity sold product quantity.
    */
    event ExtraFundsReturned(address indexed buyer, uint extraFunds, uint id, uint quantity);


    /**
    * @dev constructor creates new shop.
    * @param _name name of shop.
    * @param _description description of shop.
    * @param _logo logo url of shop.
    */
    constructor (string _name, string _description, string _logo) public {
        name = _name;
        description = _description;
        logo = _logo;
    }


    /**
    * @dev updates shop info.
    * @param _name name of shop.
    * @param _description description of shop.
    * @param _logo logo url of shop.
    * //revert
    */
    function updateShopInfo(string _name, string _description, string _logo) external onlyOwner {
        name = _name;
        description = _description;
        logo = _logo;
    }

    /**
    * @dev returns shop info.
    * @return string shopName, string shopDescription, string shopLogo
    */
    function getShopInfo() external view returns (string shopName, string shopDescription, string shopLogo) {
        return (name, description, logo);
    }

    /**
    * @dev Add a new product.
    * @param _name name of product.
    * @param _price price of product.
    * @param _quantity quantity of product.
    * @param _image image url of product.
    * //revert
    */
    function addProduct(string _name, uint _price, uint32 _quantity, string _image) public onlyOwner {
        uint id = products.add(_name, _price, _quantity, _image);
        emit ProductAdded(owner, id, _name, _price, _quantity, _image);
    }

    /**
    * @dev Remove a product.
    * @param _productId id of product.
    * //revert
    */
    function removeProduct(uint _productId) external onlyOwner {
        products.remove(_productId);
        emit ProductRemoved(owner, _productId);
    }

    /**
    * @dev Return a product.
    * @param _productId id of product.
    * @return (
    *    uint productId,
    *    string productName,
    *    uint productPrice,
    *    uint32 productQuantity,
    *    string productImage,
    *    bool productExists
    * )
    * //revert
    */
    function getProduct(uint _productId) public view
        returns (
            uint productId,
            string productName,
            uint productPrice,
            uint32 productQuantity,
            string productImage,
            bool productExists
        )
    {
        return products.get(_productId);
    }

    /**
    * @dev Update a product info.
    * @param _productId id of product.
    * @param _name name of product.
    * @param _price price of product.
    * @param _quantity quantity of product.
    * @param _image image url of product.
    * //revert
    */
    function updateProduct(uint _productId, string _name, uint _price, uint32 _quantity, string _image) external onlyOwner {
        products.update(_productId, _name, _price, _quantity, _image);
        emit ProductUpdated(owner, _productId, _name, _price, _quantity, _image);
    }

    /**
    * @dev Return a next product.
    * @param _productId id of product.
    * @return (
    *    uint productId,
    *    string productName,
    *    uint productPrice,
    *    uint32 productQuantity,
    *    string productImage,
    *    bool productExists
    * )
    */
    function getNextProduct(uint _productId) external view
        returns (
            uint productId,
            string productName,
            uint productPrice,
            uint32 productQuantity,
            string productImage,
            bool productExists
        )
    {
        return products.getNextProduct(_productId);
    }

    /**
    * @dev Return a prev product.
    * @param _productId id of product.
    * @return (
    *    uint productId,
    *    string productName,
    *    uint productPrice,
    *    uint32 productQuantity,
    *    string productImage,
    *    bool productExists
    * )
    */
    function getPrevProduct(uint _productId) external view
        returns (
            uint productId,
            string productName,
            uint productPrice,
            uint32 productQuantity,
            string productImage,
            bool productExists
        )
    {
        return products.getPrevProduct(_productId);
    }

    /**
    * @dev Return count of products.
    * @return (uint)
    */
    function productsCount() external view returns (uint) {
        return products.productsCount();
    }

    /**
    * @dev Sell a product.
    * @param _productId id of product.
    * @param _quantity quantity of product.
    * //revert
    */
    function buyProduct(uint _productId, uint32 _quantity) external payable whenNotPaused {
        uint productPrice;
        uint productQuantity;
        require(_quantity > 0, "You should buy at least 1 product.");

        (,, productPrice, productQuantity,,) = getProduct(_productId);

        uint total = productPrice.mul(_quantity);
        require(total <= msg.value, "Not enough funds.");

        decProductQuantity(_productId, _quantity);

        emit ProductBought(msg.sender, msg.value, _productId, _quantity);

        uint restMoney = msg.value.sub(total);
        if (restMoney > 0) {
            msg.sender.transfer(restMoney);
            emit ExtraFundsReturned(msg.sender, restMoney, _productId, _quantity);
        }
    }

    /**
    * @dev withdraw a funds.
    * @param _funds funds in wei .
    * //revert
    */
    function withdraw(uint _funds) external onlyOwner {
        require(_funds <= address(this).balance, "Not enough funds on shop balance.");

        address(owner).transfer(_funds);
    }

    /**
    * @dev Decrease quantity of product.
    * @param _productId id of product .
    * @param _quantity quantity of product.
    */
    function decProductQuantity(uint _productId, uint32 _quantity) internal {
        products.decQuantity(_productId, _quantity);
    }

    /**
    * @dev Increase quantity of product.
    * @param _productId id of product .
    * @param _quantity quantity of product.
    */
    function incProductQuantity(uint _productId, uint32 _quantity) internal {
        products.incQuantity(_productId, _quantity);
    }

    /**
    * @dev Check if user owns this shop.
    * @param _address user address
    * @return (bool).
    */
    function isOwner(address _address) external view returns (bool) {
        return _address == owner;
    }
}
