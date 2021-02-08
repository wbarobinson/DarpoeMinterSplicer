// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract DarpoeMinterSplicer {
    using SafeMath for uint256;

    ///// Constants

    // A mask for selecting half of the poems
    bytes32 constant mask = 0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff;
    // A mask to be used when selecting the other half
    bytes32 constant mask2 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    // The maximum number of poems
    uint256 constant public MAXPOEMS = 1000;

    // Limit the number of poem generation rounds
    uint256 constant public MAXROUNDS = 4;

    // Batch sizes for generating poems
    uint256 constant public BATCHSIZE = 250;

    ///// Constructor params

    // A hard limit to the total number of votes castable
    uint256 immutable public MAXVOTES;

    ///// Storage Vars

    // Generation rounds counter (there will be 4, because 1 round is too big for Ethereum to handle)
    uint256 public roundCounter = 0;

    // A tracker of total votes to pause the contract when at max
    uint256 public totalVotes;

    // The array of all poems
    bytes32[MAXPOEMS] public poems;

    //A mapping to keep count of each person's vote
    mapping (address => uint256) public voteBalance;

    ///// Logs

    // An event to log all newly made poems
    event MintNewPoem(uint256 rejectedPoemId, bytes32 newPoem);
    
    ///// Functions

    // TODO: Should these not be immutable and instead have an onlyOwner setter?
    constructor(uint256 maxVotes) {
        MAXVOTES = maxVotes;
    }

    /*
     * A function that will delete a poem from the array of poems and
     * in its place will go a new poem created by evolvePoem function
     * @param _selectedPoemId is the index of the poem in the array poems that will be spliced   
     * @param _rejectedPoemId is the index of the poem in the array poems that will be deleted
     * @emits _rejectedPoemId, msg.sender and new poem
     * @returns nothing
     */
    function generatePoems() public {
        // Prevent regeneration
        require(roundCounter < MAXROUNDS, "Max poems have been reached");
        // Create the remaining poems
        console.log(roundCounter);
        for(uint256 i = (250 * roundCounter); i < 250 * (roundCounter + 1) ; i++) {
            poems[i] = keccak256(abi.encodePacked(i));
            emit MintNewPoem(i, poems[i]);
        }
        roundCounter++;
    }

    function selectPoem(uint256 _selectedPoemId, uint256 _rejectedPoemId) public {
        require(totalVotes < MAXVOTES, "Max votes have been cast");
        require(
            _selectedPoemId >= 0 &&
            _selectedPoemId < MAXPOEMS &&
            _rejectedPoemId >= 0 &&
            _rejectedPoemId < MAXPOEMS &&
            _selectedPoemId != _rejectedPoemId,
            "invalid poem id"
        );

        bytes32 newPoem = evolvePoem(_selectedPoemId, _rejectedPoemId);
        poems[_rejectedPoemId] = newPoem;
        voteBalance[msg.sender] = voteBalance[msg.sender] + 1;
        totalVotes++;
        emit MintNewPoem(_rejectedPoemId, newPoem);
    }

    /*
     * A function to get all poems
     * @returns the array of all poems
     */
    function getPoems() public view returns (bytes32[MAXPOEMS] memory) {
        return poems;
    }

    /*
     * A function to get all votes cast by an address
     */
    function getVoteBalance(address _address) public view returns (uint256) {
      return voteBalance[_address];
    }

    /*
     * A function to get all votes cast
     * @returns the total of all votes cast
     */
    function getTotalVotes() public view returns (uint256) {
      return totalVotes;
    }

    /*
     * A function to get a poem at a given index
     * @param id is the index of the poem in the array poems
     * @returns the poem at the index specified
     */
    function getPoem(uint256 id) view public returns (bytes32) {
        return poems[id];
    }

    /*
     * An internal function to get the splice of two poems
     * @returns one new poem
     */
    function evolvePoem(uint256 _selectedPoemId, uint256 _rejectedPoemId) internal view returns (bytes32) {
        // Move the mask to pick a random 128 contiguous bits
        uint256 arbitraryGeneShare = uint(block.timestamp.mod(128));
        // Move the mask
        bytes32 tempMask1 = mask << arbitraryGeneShare;
        // Create the opposite mask
        bytes32 tempMask2 = mask2 ^ tempMask1;
        // Mask selected poem to keep half
        bytes32 keep1 = poems[_selectedPoemId] & tempMask1;
        // Mask arbitrary poem to keep opposite half
        bytes32 keep2 = poems[_rejectedPoemId] & tempMask2;
        // Merge poems by masking one with the other
        bytes32 evolvedPoem = keep1 | keep2;

        return evolvedPoem;
    }
}
