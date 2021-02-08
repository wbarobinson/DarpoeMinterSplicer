import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });
import { NetworkUserConfig } from "hardhat/types";

// load plugins
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "solidity-coverage";

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY

// helper for creating network configs
function createConfig(network: keyof typeof chainIds): NetworkUserConfig {
  // configure alchemy
  if (!alchemyApiKey) {
    throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
  }

  // Ensure that we have all the environment variables we need.
  let accounts: any;
  if (!process.env.MNEMONIC) {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("Please set your MNEMONIC or PRIVATE_KEY in a .env file");
    }
    accounts = [process.env.PRIVATE_KEY];
  } else {
    accounts = {
      count: 10,
      initialIndex: 0,
      mnemonic: process.env.MNEMONIC,
      path: "m/44'/60'/0'/0",
    };
  }

  const url: string = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`
  return {
    accounts,
    chainId: chainIds[network],
    url,
  };
}

let hardhatCfg: any = {
  chainId: chainIds.hardhat,
}

if (process.env.FORK) {
  hardhatCfg.forking = {
    url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
  }
}

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: hardhatCfg,
    goerli: createConfig("goerli"),
    kovan: createConfig("kovan"),
    rinkeby: createConfig("rinkeby"),
    ropsten: createConfig("ropsten"),
    mainnet: createConfig("mainnet"),
  },
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    }
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: "0091d2de-16cd-45be-b278-c8bd3263736a",
    enabled: process.env.REPORT_GAS ? true : false,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};
