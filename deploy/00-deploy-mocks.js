// Aqui vamos a crear el MOCKS para cuando hagamos un deploy al default: hardhat o al node localhost

// Tenemos que hacer un deploy contract similar al que ya hemos creado anteriormente.

const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const DECIMALS = "8";
const INITIAL_ANSWER = "200000000000";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //Aqui incluimos el IF statment para idicar que solo se ejecute este deploy mocks si tenemso la chain de hardhat o localhost

  if (chainId == 31337) {
    log("Local network detected!! Deploying contract to local");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });

    log("MOcks DePloYed!!");
    log(
      "-----------------------------------------------------------------------------------"
    );
  }
};

/**
 * !Con este module.exports.tags, estamos creando unos tags que los podremos usar en el comando y correr directamente
 * ! este mocks.
 */
module.exports.tags = ["all", "mocks"];
