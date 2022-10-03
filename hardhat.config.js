require("@nomicfoundation/hardhat-toolbox");

//Importamos Hardhat-deploy para hacer el deploy más fácil y rápido
require("hardhat-deploy");

// Importamos dotenv.
require("dotenv").config();

//Importamos @nomiclabs/hardhat-etherscan, que nos va a permitir a verificar automaticamente nuestros contratos
require("@nomiclabs/hardhat-etherscan");

//Importamos Hardhat-gas-reporter para poder ver cuanto cuestan nuestras interacciones con el contrato en lo test,
//antes de subirlo a produccion
require("hardhat-gas-reporter");

//Importamos SOLIDITY-COVERAGE, un plugin que nos indica si todo el codigo de nuestro .sol está siendo testeado.
require("solidity-coverage");

//Importamos WAFFLE
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */

//Añadimos como cosnt el GOERLI_RPC_URL para poder leer mejor.
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;

module.exports = {
  solidity: "0.8.7",
  /**
   * !Aquí podemos indicar en que network queremos trabajar como default.
   * *SI que reremos la de hardhat -->
   */

  defaultNetwork: "hardhat",
  /**
   * ! Atención, podemos añadir otras networks, para poder cambiar el setup rapidamente.
   * *EN este caso, hay que escribir el RPC,private KEy y CHainID usando .env
   */

  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmation: 6,
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      blockConfirmation: 6,
    },
    localHostNode: {
      url: " http://127.0.0.1:8545/",
      //accounts: Hardhat ya lo proporciona directamente,
      chainId: 31337,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "EUR",
    coinmarketcap: COINMARKETCAP_API_KEY,
    /*token: "matic",*/
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
  mocha: {
    timeout: 500000,
  },
};
