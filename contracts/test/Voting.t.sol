// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {Election} from "../src/Election.sol";

contract VotingTest is Test {
    Election election;
    address admin = address(0x1);
    address voter = address(0x2);
    address randomUser = address(0x3);

    // Helper function to set up a fully ready election (Candidates registered, Voter registered & verified)
    function _setupReadyElection() internal {
        vm.startPrank(admin);
        election.startRegistration();
        
        election.registerCandidate("President", "P1", 3, false, "ipfs", Election.Position.President);
        election.registerCandidate("Secretary", "S1", 3, false, "ipfs", Election.Position.Secretary);
        
        for (uint i = 0; i < 8; i++) {
            election.registerCandidate(
                string(abi.encodePacked("Member", vm.toString(i + 1))),
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
    }

    function setUp() public {
        vm.prank(admin);
        election = new Election();
    }

    // 1. tesing the deployment
    function test_Deployment() public view {
        assertTrue(address(election) != address(0));
    }

    // 2. Registration / person test
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

    function test_RevertIfUserRegistersWithoutAdminStartingPhase() public {
        vm.prank(voter);
        vm.expectRevert(); // Expects revert for wrong state/phase
        election.registerVoter();
    }

    // verify votes and voter
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

    function test_RevertIfRandomUserVerifiesVoter() public {
        vm.startPrank(admin);
        election.startRegistration();
        vm.stopPrank();

        vm.prank(voter);
        election.registerVoter();

        // randomUser tries to do admin work
        vm.prank(randomUser);
        vm.expectRevert(); // Expects "Unauthorized" or similar
        election.verifyVoter(voter);
    }

    // 5. register vote
    function test_Vote() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(30); // 30 seconds duration
        
        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3; // IDs 3 to 9
        }
        
        vm.prank(voter);
        election.vote(1, 2, members);
        
        Election.Candidate memory president = election.getCandidate(1);
        assertEq(president.voteCount, 1);
        
        Election.Candidate memory secretary = election.getCandidate(2);
        assertEq(secretary.voteCount, 1);
    }

    // 6. double voting checking
    function test_NoDoubleVoting() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(30);
        
        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }
        
        vm.prank(voter);
        election.vote(1, 2, members);
        
        // Attempt to vote again
        vm.prank(voter);
        vm.expectRevert("Already voted"); // Make sure this string matches your Election.sol exactly!
        election.vote(1, 2, members);
    }

    // 7. Time test / validity testing of the voting 
    function test_RevertIfVotingBeforeElectionStarts() public {
        _setupReadyElection();
        // NOTE: We DO NOT call election.startElection(30) here

        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }

        vm.prank(voter);
        vm.expectRevert(); // Expects revert because election hasn't started
        election.vote(1, 2, members);
    }

    function test_RevertIfVotingAfterElectionEnds() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(10); // 10 seconds duration

        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }

        // Fast forward time by 11 seconds
        vm.warp(block.timestamp + 11);

        vm.prank(voter);
        vm.expectRevert(); // Expects revert because election time has expired
        election.vote(1, 2, members);
    }

    // 8. Propose edge case / check if the vote is being given to a resspective candidaate or post
    function test_RevertIfVotingForInvalidCandidateId() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(30);

        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }

        // Try to vote for candidate ID tat doesn't exist as candidate
        vm.prank(voter);
        vm.expectRevert(); // Expects revert for out-of-bounds/invalid ID
        election.vote(99, 2, members);
    }

    function test_RevertIfWrongPositionVoted() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(30);

        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }

        // Try to vote for a General Member (ID 3) as the President
        vm.prank(voter);
        vm.expectRevert(); // Expects revert because ID 3 is not a President
        election.vote(3, 2, members);
    }

    // 9. result testing
    function test_GetResults() public {
        _setupReadyElection();

        // We need a second voter to make results interesting
        vm.prank(randomUser);
        election.registerVoter();
        vm.prank(admin);
        election.verifyVoter(randomUser);

        vm.prank(admin);
        election.startElection(30);

        uint256[] memory members = new uint256[](7);
        for (uint i = 0; i < 7; i++) {
            members[i] = i + 3;
        }

        // Voter 1 votes
        vm.prank(voter);
        election.vote(1, 2, members);

        // Voter 2 votes (same choices to test accumulation)
        vm.prank(randomUser);
        election.vote(1, 2, members);

        // End election if you have an endElection function, otherwise warp time
        vm.warp(block.timestamp + 31);

        // Verify vote counts accumulated correctly
        Election.Candidate memory president = election.getCandidate(1);
        assertEq(president.voteCount, 2); // 2 votes for President
        
        Election.Candidate memory member3 = election.getCandidate(3);
        assertEq(member3.voteCount, 2); // 2 votes for Member 3
    }

    // 10. admin cntroling access 
    function test_RevertIfRandomUserStartsRegistration() public {
        vm.prank(randomUser);
        vm.expectRevert(); // Expects "Unauthorized" revert
        election.startRegistration();
    }

    function test_RevertIfRandomUserStartsElection() public {
        _setupReadyElection();

        vm.prank(randomUser);
        vm.expectRevert(); // Expects "Unauthorized" revert
        election.startElection(30);
    }

    function test_RevertIfAdminRegistersCandidateDuringVotingPhase() public {
        _setupReadyElection();
        
        vm.prank(admin);
        election.startElection(30);

        // Admin tries to sneak in a new candidate while voting is active
        vm.prank(admin);
        vm.expectRevert(); // Expects revert because state is no longer Registration
        election.registerCandidate("Fake", "F1", 3, false, "ipfs", Election.Position.President);
    }
}