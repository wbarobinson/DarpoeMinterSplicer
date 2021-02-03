const { expect } = require("chai");
const { ethers } = require("hardhat");

//TEST 1 - Poems can be generated, but only once
  //Ensure that calling generatePoems does not generate poems twice
 describe("DarpoeMinterSplicer", function() {
     it("Should create MAXPOEMS and only four times", async () => {
    const DMS = await ethers.getContractFactory("DarpoeMinterSplicer"); 
    const dms = await DMS.deploy();

    await dms.deployed();
    await dms.generatePoems();
    await dms.generatePoems();
    await dms.generatePoems();
    await dms.generatePoems();
    await expect(dms.generatePoems()).to.be.revertedWith("Max poems have been reached");

    const arr = await dms.getPoems();
    expect(Object.keys(arr)).to.have.lengthOf(1000);
    console.log(arr.length);
  });

    //TEST 2 - Rejecting a poem should mean that it wont be there anymore
  //Ensure that get poems are overwritten
  it("should allow people to pick one poem over another", async () => {
    const DMS = await ethers.getContractFactory("DarpoeMinterSplicer"); 
    const dms = await DMS.deploy();

    await dms.deployed();
    await dms.generatePoems();
    // console.log(await dms.getPoem(2))
    const poemPrePick = dms.getPoem(2);
    await dms.selectPoem(1,2);
    // console.log(await dms.getPoem(2))
    const poemPostPick = dms.getPoem(2);
    await expect(poemPrePick).to.not.equal(poemPostPick);
  });
    //TEST 3 - Selecting a poem should increase the users voteBalance
  //Ensure that get poems are overwritten
  it("should increase voters vote balance each time they vote", async () => {
    const DMS = await ethers.getContractFactory("DarpoeMinterSplicer"); 
    const dms = await DMS.deploy();

    const [owner] = await ethers.getSigners();
    await dms.deployed();
    await dms.generatePoems();

    await dms.selectPoem(1,2);
    const balancePostPick = await dms.getVoteBalance(owner.address);
    await expect(balancePostPick).to.equal(1);
    await dms.selectPoem(1,2);
    const balancePostSecondPick = await dms.getVoteBalance(owner.address);
    await expect(balancePostSecondPick).to.equal(2);
  });

/*   //TEST 4 - Selecting a poem should be impossible once MAXVOTES have been cast
  //Ensure that get poems are no longer overwritten after a certain number of overwrites

  it("should stop votes from voting after MAXVOTES are cast", async () => {
    const DMS = await ethers.getContractFactory("DarpoeMinterSplicer"); 
    const dms = await DMS.deploy();
    const MAXVOTES = 100;
    await dms.deployed();
    await dms.generatePoems();

    for(i=0; i<MAXVOTES; i++) {
    await dms.selectPoem(1,2);
    }

    const totalVotes = await dms.getTotalVotes();
    await expect(totalVotes).to.equal(MAXVOTES);
    //This part of the test only works if you set MAXVOTES to a smaller number in the contract for testing.
    //await expect(dms.selectPoem(1,2)).to.be.revertedWith("Max votes have been cast")
  }); */
  
    //TEST 5 - Getting a poem with the function should work
  //Ensure that poems are gettable
  it("should get a poem and get two poems", async () => {
    const DMS = await ethers.getContractFactory("DarpoeMinterSplicer"); 
    const dms = await DMS.deploy();

    await dms.deployed();
    await dms.generatePoems();

    console.log(await dms.getPoem(1));
    console.log(await dms.getTwoPoems());
  }); 
});