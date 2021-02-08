import { Signer } from "@ethersproject/abstract-signer";
import { expect } from "chai";
import { ethers, waffle } from "hardhat";
const { deployContract } = waffle;

import DMSArtifact from "../artifacts/contracts/DarpoeMinterSplicer.sol/DarpoeMinterSplicer.json";
import * as types from "../typechain";

// TEST 1 - Poems can be generated, but only once
// Ensure that calling generatePoems does not generate poems twice
describe("DarpoeMinterSplicer", function () {
  let dms: types.DarpoeMinterSplicer;
  let signers: Signer[];
  let user: Signer;

  before(async () => {
    signers = await ethers.getSigners();
    user = signers[0];
  });

  const MAXPOEMS = 1000;
  const MAXVOTES = 100000;

  beforeEach(async () => {
    dms = (await deployContract(user, DMSArtifact, [
      MAXVOTES,
    ])) as types.DarpoeMinterSplicer;
  });

  it("Should create MAXPOEMS and only four times", async () => {
    await dms.generatePoems();
    await dms.generatePoems();
    await dms.generatePoems();
    await dms.generatePoems();
    const arr = await dms.getPoems();
    expect(arr.length).to.be.eq(MAXPOEMS);
    await expect(dms.generatePoems()).to.be.revertedWith(
      "Max poems have been reached"
    );
  });

  // TEST 2 - Rejecting a poem should mean that it wont be there anymore
  // Ensure that get poems are overwritten
  it("should allow people to pick one poem over another", async () => {
    await dms.generatePoems();
    const poemPrePick = await dms.getPoem(2);

    await dms.selectPoem(1, 2);

    const poemPostPick = await dms.getPoem(2);
    expect(poemPrePick).to.not.equal(poemPostPick);
  });

  // TEST 3 - Selecting a poem should increase the users voteBalance
  // Ensure that get poems are overwritten
  it("should increase voters vote balance each time they vote", async () => {
    const userAddr = await user.getAddress();

    await dms.generatePoems();

    await dms.selectPoem(1, 2);
    expect(await dms.getVoteBalance(userAddr)).to.equal(1);

    await dms.selectPoem(1, 2);
    expect(await dms.getVoteBalance(userAddr)).to.equal(2);
  });

  // TEST 4 - Selecting a poem should be impossible once MAXVOTES have been cast
  // Ensure that get poems are no longer overwritten after a certain number of overwrites
  it("should stop votes from voting after MAXVOTES are cast", async () => {
    const maxVotes = 100;
    dms = (await deployContract(user, DMSArtifact, [
      maxVotes,
    ])) as types.DarpoeMinterSplicer;
    await dms.generatePoems();

    for (let i = 0; i < maxVotes; i++) {
      await dms.selectPoem(1, 2);
    }

    expect(await dms.getTotalVotes()).to.equal(maxVotes);
    await expect(dms.selectPoem(1, 2)).to.be.revertedWith(
      "Max votes have been cast"
    );
  });
});
