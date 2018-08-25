pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title List of ids library
 * @author Ihor Borysyuk
 * @dev This library implemets two way list to store ids of entity.
 *      You can add/remove ids and "walk" in two directions
 */
library List {

    using SafeMath for uint;

    struct ListData {
        mapping (bytes32 => uint) ring;
        uint count;
    }

    /**
    * @dev Checks if id is not Zero.
    * @param _id id of some entity.
    * //revert
    */
    modifier isNotZero(uint _id) {
        require(_id > 0, "Zero id is forbiden");
        _;
    }

    /**
    * @dev Checks if id exists into the list.
    * @param _id id of some entity.
    * //revert
    */
    modifier exists(ListData storage self, uint _id) {
        require(self.ring[generateCurrKey(_id)] == _id, "this id should exists in list");
        _;
    }

    /**
    * @dev Checks if id NOT exists into the list.
    * @param _id id of some entity.
    * //revert
    */
    modifier notExists(ListData storage self, uint _id) {
        require(self.ring[generateCurrKey(_id)] != _id, "this id should NOT exists in list");
        _;
    }

    /**
    * @dev Add a new id into list.
    * @param _id id of some entity.
    * //revert
    */
    function add(ListData storage self, uint _id) internal isNotZero(_id) notExists(self, _id) {
        bytes32 zeroPrevKey = generatePrevKey(0);
        uint lastId = self.ring[zeroPrevKey];
        self.ring[generateNextKey(lastId)] = _id;
        self.ring[generatePrevKey(_id)] = lastId;
        self.ring[generateCurrKey(_id)] = _id;
        self.ring[zeroPrevKey] = _id;
        self.count = self.count.add(1);
    }

    /**
    * @dev Remove id from the list.
    * @param _id id of some entity.
    * //revert
    */
    function remove(ListData storage self, uint _id) internal isNotZero(_id) exists(self, _id) {
        bytes32 prevIdKey = generatePrevKey(_id);
        bytes32 nextIdKey = generateNextKey(_id);
        bytes32 currIdKey = generateCurrKey(_id);

        uint prevId = self.ring[prevIdKey];
        uint nextId = self.ring[nextIdKey];
        self.ring[generateNextKey(prevId)] = nextId;
        self.ring[generatePrevKey(nextId)] = prevId;

        delete self.ring[prevIdKey];
        delete self.ring[nextIdKey];
        delete self.ring[currIdKey];
        self.count = self.count.sub(1);
    }

    /**
    * @dev Get next id from the list.
    * @param _id id of some entity, put 0 to get first one.
    * @return (uint id)
    * //revert
    */
    function getNextId(ListData storage self, uint _id) internal view returns (uint id) {
        id = self.ring[generateNextKey(_id)];
        require(id > 0, "Unexists next id");
    }

    /**
    * @dev Get prev id from the list.
    * @param _id id of some entity, put 0 to get last one.
    * @return (uint id)
    * //revert
    */
    function getPrevId(ListData storage self, uint _id) internal view returns (uint id) {
        id = self.ring[generatePrevKey(_id)];
        require(id > 0,  "Unexists prev id");
    }

    /**
    * @dev Build key to store "current" id in a dictionary.
    * @param _id id of some entity.
    * @return (bytes32 key)
    */
    function generateCurrKey(uint _id) internal pure returns (bytes32 key) {
        return keccak256(abi.encodePacked("curr", _id));
    }

    /**
    * @dev Build key to store "next" id in a dictionary.
    * @param _id id of some entity.
    * @return (bytes32 key)
    */
    function generateNextKey(uint _id) internal pure returns (bytes32 key) {
        return keccak256(abi.encodePacked("next", _id));
    }

    /**
    * @dev Build key to store "prev" id in a dictionary.
    * @param _id id of some entity.
    * @return (bytes32 key)
    */
    function generatePrevKey(uint _id) internal pure returns (bytes32 key) {
        return keccak256(abi.encodePacked("prev", _id));
    }

    /**
    * @dev Returns count of ids
    * @return (uint)
    */
    function itemsCount(ListData storage self) internal view returns (uint) {
        return self.count;
    }
}
