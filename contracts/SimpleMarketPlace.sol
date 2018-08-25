pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./libraries/ShopCatalog.sol";
import "./libraries/SimpleShopFactory.sol";
import "./SimpleShop.sol";

/**
* @title SimpleMarketPlace
* @author Ihor Borysyuk
* @dev MarketPlace, Shops factory Roles.
*/
contract SimpleMarketPlace is Ownable, Pausable, Destructible {

    using ShopCatalog for ShopCatalog.ShopList;
    using List for List.ListData;

    struct Role {
        bool isAdmin;
        bool isShopOwner;
    }

    mapping (address => List.ListData) internal shopIdsByOwner;
    ShopCatalog.ShopList internal shops;
    mapping (address => Role) internal roles;

    /**
    * @dev Event for Admin role has been added.
    * @param userAddress Who got admin role (Indexed).
    */
    event AdminAdded(address indexed userAddress);

    /**
    * @dev Event for Admin role has been removed.
    * @param userAddress Who lost admin role (Indexed).
    */
    event AdminRemoved(address indexed userAddress);

    /**
    * @dev Event for ShopOwner role has been added.
    * @param userAddress Who got ShopOwner role (Indexed).
    */
    event ShopOwnerAdded(address indexed userAddress);

    /**
    * @dev Event for ShopOwner role has been removed.
    * @param userAddress Who lost ShopOwner role (Indexed).
    */
    event ShopOwnerRemoved(address indexed userAddress);


    /**
    * @dev Event for Shop has been created.
    * @param shopOwner Who create a new shop (Indexed).
    * @param shopAddress address of a new shop (Indexed).
    * @param shopId id of shop in MarketPlace.
    * @param shopName name of shop.
    * @param shopDescription description of shop.
    * @param shopLogo logo url of shop.
    */
    event ShopCreated(
        address indexed shopOwner,
        address indexed shopAddress,
        uint shopId,
        string shopName,
        string shopDescription,
        string shopLogo
    );

    /**
    * @dev Event for Shop has been removed.
    * @param shopOwner Who remove a shop (Indexed).
    * @param shopAddress address of a removed shop (Indexed).
    * @param shopId id of shop in MarketPlace.
    */
    event ShopRemoved(address indexed shopOwner, address indexed shopAddress, uint shopId);


    /**
    * @dev Constructor of SimpleMarketPlace.
    */
    constructor () public {
        addAdmin(msg.sender);
    }


    /**
    * @dev Checks if user has Admin or Owner role.
    * // revert
    */
    modifier shouldBeAdminOrOwner() {
        require(roles[msg.sender].isAdmin || (msg.sender == owner), "shouldBeAdminOrOwner");
        _;
    }

    /**
    * @dev Checks if user has ShopOwner role.
    * // revert
    */
    modifier shouldBeShopOwner() {
        require(roles[msg.sender].isShopOwner, "shouldBeShopOwner");
        _;
    }

    /**
    * @dev Add Admin role for user.
    * @param _userAddress user address
    * // revert
    */
    function addAdmin(address _userAddress) public onlyOwner {
        roles[_userAddress].isAdmin = true;
        emit AdminAdded(_userAddress);
    }

    /**
    * @dev Remove Admin role for user.
    * @param _userAddress user address
    * // revert
    */
    function removeAdmin(address _userAddress) external onlyOwner {
        roles[_userAddress].isAdmin = false;
        emit AdminRemoved(_userAddress);
    }

    /**
    * @dev Add ShopOwner role for user.
    * @param _userAddress user address
    * // revert
    */
    function addShopOwner(address _userAddress) external shouldBeAdminOrOwner {
        roles[_userAddress].isShopOwner = true;
        emit ShopOwnerAdded(_userAddress);
    }

    /**
    * @dev Remove ShopOwner role for user.
    * @param _userAddress user address
    * // revert
    */
    function removeShopOwner(address _userAddress) external shouldBeAdminOrOwner {
        roles[_userAddress].isShopOwner = false;
        emit ShopOwnerRemoved(_userAddress);
    }

    /**
    * @dev Create new shop.
    * @param _name name of new shop
    * @param _description description of new shop
    * @param _logo user logo of new shop
    * // revert
    */
    function createShop(string _name, string _description, string _logo) external shouldBeShopOwner {
        /* address newShop = new SimpleShop(_name, _description, _logo);
        SimpleShop(newShop).transferOwnership(msg.sender); */
        address newShop = SimpleShopFactory.create(_name, _description, _logo);
        uint shopId = shops.add(newShop);
        shopIdsByOwner[msg.sender].add(shopId);
        emit ShopCreated(msg.sender, newShop, shopId, _name, _description, _logo);
    }

    /**
    * @dev Remove a shop from marketplace but doesnot kill shop contract.
    * @param _id name of removed shop
    * // revert
    */
    function removeShop(uint _id) external shouldBeShopOwner {
        (,address shopAddress,) = shops.get(_id);
        shopIdsByOwner[msg.sender].remove(_id);
        shops.remove(_id);
        emit ShopRemoved(msg.sender, shopAddress, _id);
    }

    /**
    * @dev Returns next my shop.
    * @param _fromId start shop id, 0 - if you want to get first one
    * @return (
    *     address shopContractAddress,
    *     uint shopId,
    *     string shopName,
    *     string shopDescription,
    *     string shopLogo,
    *     bool shopExists
    * )
    * // revert
    */
    function getMyNextShop(uint _fromId) external view shouldBeShopOwner
        returns (
            address shopContractAddress,
            uint shopId,
            string shopName,
            string shopDescription,
            string shopLogo,
            bool shopExists
        )
    {
        shopId = shopIdsByOwner[msg.sender].getNextId(_fromId);
        (shopId, shopContractAddress, shopExists) = shops.get(shopId);
        (shopName, shopDescription, shopLogo) = SimpleShop(shopContractAddress).getShopInfo();
    }

    /**
    * @dev Returns prev my shop.
    * @param _fromId start shop id, 0 - if you want to get last one
    * @return (
    *     address shopContractAddress,
    *     uint shopId,
    *     string shopName,
    *     string shopDescription,
    *     string shopLogo,
    *     bool shopExists
    )
    * // revert
    */
    function getMyPrevShop(uint _fromId) external view shouldBeShopOwner
        returns (
            address shopContractAddress,
            uint shopId,
            string shopName,
            string shopDescription,
            string shopLogo,
            bool shopExists
        )
    {
        shopId = shopIdsByOwner[msg.sender].getPrevId(_fromId);
        (shopId, shopContractAddress, shopExists) = shops.get(shopId);
        (shopName, shopDescription, shopLogo) = SimpleShop(shopContractAddress).getShopInfo();
    }

    /**
    * @dev Returns count of my shop.
    * @return (uint)
    */
    function myShopsCount() external view shouldBeShopOwner returns (uint) {
        return shopIdsByOwner[msg.sender].itemsCount();
    }

    /**
    * @dev Returns next shop for all users.
    * @param _fromId start shop id, 0 - if you want to get first one
    * @return (
    *     address shopContractAddress,
    *     uint shopId,
    *     string shopName,
    *     string shopDescription,
    *     string shopLogo,
    *     bool shopExists
    * )
    * // revert
    */
    function getNextShop(uint _fromId) external view
        returns (
            address shopContractAddress,
            uint shopId,
            string shopName,
            string shopDescription,
            string shopLogo,
            bool shopExists
        )
    {
        (shopId, shopContractAddress, shopExists) = shops.getNextShop(_fromId);
        (shopName, shopDescription, shopLogo) = SimpleShop(shopContractAddress).getShopInfo();
    }

    /**
    * @dev Returns prev shop for all users.
    * @param _fromId start shop id, 0 - if you want to get last one
    * @return (
    *     address shopContractAddress,
    *     uint shopId,
    *     string shopName,
    *     string shopDescription,
    *     string shopLogo,
    *     bool shopExists
    * )
    * // revert
    */
    function getPrevShop(uint _fromId) external view
        returns (
            address shopContractAddress,
            uint shopId,
            string shopName,
            string shopDescription,
            string shopLogo,
            bool shopExists
        )
    {
        (shopId, shopContractAddress, shopExists) = shops.getPrevShop(_fromId);
        (shopName, shopDescription, shopLogo) = SimpleShop(shopContractAddress).getShopInfo();
    }

    /**
    * @dev Returns count of all shop.
    * @return (uint)
    */
    function shopsCount() external view returns (uint) {
        return shops.shopsCount();
    }

    /**
    * @dev Returns roled of current user(account).
    * @return (bool isOwner, bool isAdmin, bool isShopOwner)
    */
    function getRoles() external view returns (bool isOwner, bool isAdmin, bool isShopOwner) {
        isOwner = (msg.sender == owner);
        isAdmin = roles[msg.sender].isAdmin;
        isShopOwner = roles[msg.sender].isShopOwner;
    }

    /**
    * @dev Checks if user has Admin role.
    * @param _address address of user
    * @return (bool)
    */
    function isAdmin(address _address) external view returns (bool) {
        return roles[_address].isAdmin;
    }

    /**
    * @dev Checks if user has ShopOwner role.
    * @param _address address of user
    * @return (bool)
    */
    function isShopOwner(address _address) external view returns (bool) {
        return roles[_address].isShopOwner;
    }

    /**
    * @dev Checks if user owns this shop.
    * @param _shopAddress address of shop
    * @param _userAddress address of user
    * @return (bool)
    */
    function isShopCreatedByUser(address _shopAddress, address _userAddress) external view returns (bool) {
        return SimpleShop(_shopAddress).isOwner(_userAddress);
    }
}
