//Vamos a importar las librerias, etc...
// Ya que utilzamos el Plugin hardhat-deploy, solo deberemos especificar una function
/**
 * !async function deployFunc() {
 * !console.log("hi");
 * !}
 * !module.exports.default = deployFunc;
 * !Exportamos como default la function deployFunc, para que hardhat-deploy encuentre esta funcion y la corra como default
 */
const { network } = require("hardhat");
const {
  networkConfig,
  developmentChain,
} = require("../helper-hardhat-config.js");

const { verify } = require("../utils/verify");
// Esto es igual a esto otro --> const helperConfig = require("./helper-hardhat-config.js");
//const networkConfig = helperConfig.networkConfig

// Esto es basicamente lo que hay que hacer, pero en el plugin lo hacen añadiendo una async anonimus function y que se le dan
// ciertos parametros pertenecientes a HRE= hardhat enviroment

// Esto es Igual a : module.exports = async (hre){ getNamedAccounts y deployments de HRE}. OSea HRE tiene estos parametros dentro
module.exports = async ({ getNamedAccounts, deployments }) => {
  //Sacamos la function deploy y log de dentro de deployments
  const { deploy, log } = deployments;

  // combramos deployer como metodo para sacar nombre de cuentas
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;

  /**
   * ! Cuando usemos localhost, hardhat network vamos a usar un MOCK
   * *Mock se define como una simulación del objeto verdadero para pruebas en entorno local
   */

  /**
   * !Esta linea de codigo es la que hace que podamos introducir la chainId y direccion correcta para cada chain
   */
  let ethUsdPriceFeedAddress;

  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("----------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");
  /**
   * *¿que hacer para deploy el contrato al igual que hicimos con contractFactory?
   */

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // arguments que agregar, en nuestro caso el unico argumento por ahora, es priceFeedAddress establecido en el constructor
    log: true,
    waitConfirmations: network.config.blockConfirmation || 1,
  });
  log("------------------------------------------");
  log(`FundMe deployed at ${fundMe.address}`);
  log("------------------------------------------");

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //Recuerda que verify, tiene dos parametros, adrress del contract y argumentos.
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

//Tags para deploy este contrato directamente.

module.exports.tags = ["all", "fundme"];
