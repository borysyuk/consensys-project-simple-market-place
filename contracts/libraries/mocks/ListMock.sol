pragma solidity 0.4.24;

import "../List.sol";

/**
 * @title ListMock
 * @author Ihor Borysyuk
 * @dev Mock contract to test List library. All docs are into origin library.
 */
contract ListMock {

    using List for List.ListData;

    List.ListData private list;

    function add(uint _id) external {
        list.add(_id);
    }

    function remove(uint _id) external {
        list.remove(_id);
    }

    function getNextId(uint _id) external view returns (uint) {
        return list.getNextId(_id);
    }

    function getPrevId(uint _id) external view returns (uint) {
        return list.getPrevId(_id);
    }

    function itemsCount() external view returns (uint) {
        return list.itemsCount();
    }
}
