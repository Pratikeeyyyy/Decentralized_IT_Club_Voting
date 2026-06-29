// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {Election} from "../src/Election.sol";

contract VotingTest is Test {
    Election election;
    address admin = address(0x1);
    address voter = address(0x2);

    function setUp() public {
        vm.prank(admin);
        election = new Election();
    }

 function test_Deployment() public view {
    assertTrue(address(election) != address(0));
}

    function test_RegisterCandidate() public {
        vm.startPrank(admin);
        election.startRegistration();
        election.registerCandidate("John", "S001", 3, false, "ipfs://img", Election.Position.President);
        vm.stopPrank();

        Election.Candidate memory c = election.getCandidate(1);
        assertEq(c.name, "John");
    }

    function test_RegisterVoter() public {
        vm.prank(admin);
        election.startRegistration();

        vm.prank(voter);
        election.registerVoter();

        Election.Voter memory v = election.getVoter(voter);
        assertTrue(v.registered);
    }

    function test_VerifyVoter() public {
        vm.startPrank(admin);
        election.startRegistration();
        vm.stopPrank();

        vm.prank(voter);
        election.registerVoter();

        vm.prank(admin);
        election.verifyVoter(voter);

        Election.Voter memory v = election.getVoter(voter);
        assertTrue(v.verified);
    }

    function test_Vote() public {
        vm.startPrank(admin);
        election.startRegistration();
        
        election.registerCandidate("President", "P1", 3, false, "ipfs", Election.Position.President);
        election.registerCandidate("Secretary", "S1", 3, false, "ipfs", Election.Position.Secretary);
        
        for (uint i = 0; i < 8; i++) {
            election.registerCandidate(
                string(abi.encodePacked("Member", vm.toString(i+1))),
                "M",
                3,
                false,
                "ipfs",
                Election.Position.GeneralMember
            );
        }
        vm.stopPrank();
        
        vm.prank(voter);
        election.registerVoter();
        
        vm.prank(admin);
        election.verifyVoter(voter);
        
        vm.prank(admin);
        election.startElection(30);
        
        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }
        
        vm.prank(voter);
        election.vote(1, 2, members);
        
        Election.Candidate memory president = election.getCandidate(1);
        assertEq(president.voteCount, 1);
    }

    function test_NoDoubleVoting() public {
        vm.startPrank(admin);
        election.startRegistration();
        election.registerCandidate("President", "P1", 3, false, "ipfs", Election.Position.President);
        election.registerCandidate("Secretary", "S1", 3, false, "ipfs", Election.Position.Secretary);
        for (uint i = 0; i < 8; i++) {
            election.registerCandidate(
                string(abi.encodePacked("Member", vm.toString(i+1))),
                "M",
                3,
                false,
                "ipfs",
                Election.Position.GeneralMember
            );
        }
        vm.stopPrank();
        
        vm.prank(voter);
        election.registerVoter();
        
        vm.prank(admin);
        election.verifyVoter(voter);
        
        vm.prank(admin);
        election.startElection(30);
        
        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }
        
        vm.prank(voter);
        election.vote(1, 2, members);
        
        vm.prank(voter);
        vm.expectRevert("Already voted");
        election.vote(1, 2, members);
    }
}