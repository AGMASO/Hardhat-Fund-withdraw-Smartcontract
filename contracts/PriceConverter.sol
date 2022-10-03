//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// vamos a crear una LIBRARY para simplificar las matematicas necesarias para saber eth en dolares

//SImilar a node.js y angular , donde sackeamos los servicios y en otros archivos para dejar el archivo principal,
//en este caso FUNDME.sol más liberado y limpio. Vamos a mover todo lo referente a conversion a esta libreria.
//Luego la exportaremos a FUNDME.sol

//IMPORTANT!! tenemos que cambiar las functions a INTERNAL

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceCoverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        /**
         * ! REFACTORING, como hemos añadidio como parametro AggregatorV3Interface priceFeed, no hay que ponerlo
         * ! más coo hard code aqui abajo. por eso o quitamos
         */

        /*//necesitaremos en ABI
        //Adress: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );*/

        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    /**
     * ! REFACTORING, añadimos como segundo parámetro AggregatorV3Interface priceFeed, para que sepa la direccion del cosntructor
     */
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
