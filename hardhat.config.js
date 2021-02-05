require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/d2e662258db945128d743db512f95542`,
      accounts: [`0x72eb6b67032d2e4e2aeb6af0767bbd187558d8ea9851ee58d98a0b26a392a631`]
    }
  }
};
