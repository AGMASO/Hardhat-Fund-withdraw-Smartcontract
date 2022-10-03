//En este js, vamos a crear la lógica, en la que le diremos que si la chainId es x que use Y, pero si es z, que use p

const networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};

//Aqui vamos a especificar cual es nuestra developmentChain, es decir la que no tiene priceFeed,

const developmentChain = ["hardhat", "localhost"];

/**
 * !Los argumentos que necesita el deployment de MockV3Aggregator, es decir el test, son decimals y initial_answer
 * ! Por esto los debemos definir aquí, y luego exportarlos al contrato.
 */

module.exports = { networkConfig, developmentChain };
